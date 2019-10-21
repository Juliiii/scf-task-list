import React from "react";
import InfiniteScroll from "react-infinite-scroller";
import axios from "../libs/axios";
import {
  Layout,
  Icon,
  List,
  Button,
  Skeleton,
  Card,
  Modal,
  Form,
  Input,
  Radio,
  Spin,
  message,
  Popconfirm
} from "antd";
import EventEmitter from "events";
import "./Task.css";

const { Header: AntdHeader } = Layout;
const ee = new EventEmitter();

const defaultState = {
  loading: false,
  hasMore: true,
  visable: false,
  isEdit: false,
  page: 0,
  pageSize: 20,
  editTask: { title: "", status: 0 },
  list: []
};

class LoadMoreList extends React.Component {
  state = defaultState;

  componentDidMount() {
    ee.on("reload", this.reload);
  }

  componentWillUnmount() {
    ee.off("reload", this.reload);
  }

  getData = async () => {
    const { page, pageSize } = this.state;
    const { type } = this.props;

    const result = await axios.post("/listTasks", {
      offset: page * pageSize,
      limit: pageSize,
      status: type === "done" ? 1 : 0
    });

    return result.data.list;
  };

  showModal = isEdit => {
    this.setState({
      visable: true,
      isEdit
    });
  };

  hideModal = () => {
    this.setState({
      visable: false,
      editTask: { ...defaultState.editTask }
    });
  };

  changeEditTask = (editTask, cb) => {
    this.setState(
      {
        editTask
      },
      () => {
        cb && cb();
      }
    );
  };

  createTask = async () => {
    const { editTask } = this.state;
    await axios.post("/createTasks", {
      title: editTask.title,
      status: 0
    });
    this.hideModal();
    ee.emit("reload", "running");
  };

  updateTask = async updateField => {
    const { editTask } = this.state;

    const isUpdateTitle = updateField === "title";

    const body = isUpdateTitle
      ? {
          ...editTask,
          title: editTask.title,
          taskId: editTask.id
        }
      : {
          ...editTask,
          taskId: editTask.id,
          status: +!editTask.status
        };

    await axios.post("/updateTasks", body);
    if (isUpdateTitle) {
      this.hideModal();
    }
    ee.emit("reload", "running");
    if (!isUpdateTitle) {
      ee.emit("reload", "done");
    }
  };

  deleteTask = async task => {
    await axios.post("/deleteTasks", {
      taskId: task.id
    });

    await this.reload(this.props.type);
  };

  reload = async type => {
    if (this.props.type !== type) {
      return;
    }

    this.setState({ ...defaultState });

    await this.handleInfiniteOnLoad();
  };

  handleInfiniteOnLoad = async () => {
    let { list, page } = this.state;
    this.setState({
      loading: true
    });

    const res = await this.getData();

    list = list.concat(res);
    this.setState({
      list,
      loading: false,
      page: page + 1
    });

    if (!res.length) {
      this.setState({
        hasMore: false
      });
    }
  };

  render() {
    const { type } = this.props;
    const { list, isEdit, visable, loading, hasMore, editTask } = this.state;

    const isRunning = type === "running";

    return (
      <Card className="task-body">
        {isRunning && (
          <div style={{ textAlign: "left", marginBottom: 10 }}>
            <Button type="primary" onClick={() => this.showModal(false)}>
              创建
            </Button>
          </div>
        )}

        <h3 className="task-body-title">
          {isRunning ? "进行中的任务" : "已完成的任务"}
        </h3>
        <div className="task-list">
          <InfiniteScroll
            pageStart={0}
            threshold={150}
            useWindow={false}
            loadMore={this.handleInfiniteOnLoad}
            hasMore={!loading && hasMore}
          >
            <List
              dataSource={list}
              renderItem={item => (
                <List.Item
                  actions={[
                    isRunning ? (
                      <Button
                        type="link"
                        key="list-loadmore-edit"
                        onClick={() => {
                          this.showModal(true);
                          this.changeEditTask(item);
                        }}
                      >
                        编辑
                      </Button>
                    ) : null,
                    <Popconfirm
                      title="确定要删除？"
                      okText="确定"
                      cancelText="取消"
                      onConfirm={() => this.deleteTask(item)}
                    >
                      <Button type="link" key="list-loadmore-delete">
                        删除
                      </Button>
                    </Popconfirm>
                  ].filter(o => !!o)}
                >
                  <Skeleton avatar title={false} loading={false} active>
                    <List.Item.Meta
                      title={
                        <div
                          style={{
                            textAlign: "left",
                            color: isRunning ? "#000" : "gray"
                          }}
                        >
                          <Radio
                            checked={!isRunning}
                            onClick={() => {
                              this.changeEditTask(item, () =>
                                this.updateTask("status")
                              );
                            }}
                          />
                          {item.title}
                        </div>
                      }
                    />
                  </Skeleton>
                </List.Item>
              )}
            />

            {loading && hasMore && (
              <div className="demo-loading-container">
                <Spin />
              </div>
            )}
          </InfiniteScroll>
        </div>
        <Modal
          title={isEdit ? "编辑任务" : "创建任务"}
          visible={visable}
          onOk={async () => {
            return isEdit ? this.updateTask("title") : this.createTask();
          }}
          onCancel={this.hideModal}
        >
          <Form>
            <Form.Item>
              <Input
                value={editTask.title}
                onChange={e =>
                  this.changeEditTask({ ...editTask, title: e.target.value })
                }
                placeholder="请输入你要进行的任务"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  }
}

function Header() {
  const logout = async () => {
    await axios.post("/logout", {});

    message.success("退出登录成功");

    setTimeout(() => {
      window.location = "/login";
    }, 500);
  };

  return (
    <AntdHeader theme="light">
      <h3 className="title">任务清单</h3>

      <span className="logout" onClick={logout}>
        退出登录
        <Icon className="logout-icon" type="logout" />
      </span>
    </AntdHeader>
  );
}

function App() {
  return (
    <Layout id="task">
      <Header />

      <LoadMoreList type="running" />

      <LoadMoreList type="done" />
    </Layout>
  );
}

export default App;
