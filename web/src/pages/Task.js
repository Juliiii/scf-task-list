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
  message
} from "antd";
import "./Task.css";

const { Header: AntdHeader } = Layout;

class LoadMoreList extends React.Component {
  state = {
    loading: false,
    hasMore: true,
    visable: false,
    isEdit: false,
    page: 0,
    pageSize: 20,
    list: []
  };

  getData = async () => {
    const { page, pageSize } = this.state;

    const result = await axios.post("/listTasks", {
      offset: page * pageSize,
      limit: pageSize
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
      visable: false
    });
  };

  changeEditTask = editTask => {
    this.setState({
      editTask
    });
  };

  createTask = async () => {};

  updateTask = async () => {};

  deleteTask = async () => {};

  reload = async () => {
    this.setState({
      loading: false,
      hasMore: true,
      visable: false,
      isEdit: false,
      editTask: "",
      list: []
    });

    await this.handleInfiniteOnLoad();
  };

  handleInfiniteOnLoad = async () => {
    let { list } = this.state;
    this.setState({
      loading: true
    });

    const res = await this.getData();

    list = list.concat(res);
    this.setState({
      list,
      loading: false
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
              Add
            </Button>
          </div>
        )}

        <h3 className="task-body-title">
          {isRunning ? "进行中的任务" : "已完成的任务"}
        </h3>
        <div className="task-list">
          <InfiniteScroll
            pageStart={0}
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
                        onClick={() => this.showModal(true)}
                      >
                        edit
                      </Button>
                    ) : null,
                    <Button
                      type="link"
                      key="list-loadmore-delete"
                      onClick={() => this.showModal(true)}
                    >
                      delete
                    </Button>
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
                            disabled={!isRunning}
                            checked={!isRunning}
                            onClick={() => {}}
                          />
                          {item.A}
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
            return isEdit ? this.editTask() : this.createTask();
          }}
          onCancel={this.hideModal}
        >
          <Form>
            <Form.Item>
              <Input
                value={editTask}
                onChange={e => this.changeEditTask(e.target.value)}
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
