import React from "react";
import InfiniteScroll from "react-infinite-scroller";
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
  Spin
} from "antd";
import "./Task.css";

const { Header } = Layout;

class LoadMoreList extends React.Component {
  state = {
    loading: false,
    hasMore: true,
    visable: false,
    isEdit: false,
    list: []
  };

  getData = async () => {
    return [
      { A: "今天要好好学习" },
      { A: "今天要好好学习" },
      { A: "今天要好好学习" },
      { A: "今天要好好学习" },
      { A: "今天要好好学习" },
      { A: "今天要好好学习" },
      { A: "今天要好好学习" }
    ];
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

  createTask = async () => {};

  updateTask = async () => {};

  deleteTask = async () => {};

  reload = async () => {
    this.setState({
      loading: false,
      hasMore: true,
      visable: false,
      isEdit: false,
      list: []
    });

    this.getData();
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
  };

  render() {
    const { type } = this.props;
    const { list, isEdit, visable, loading, hasMore } = this.state;

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
          onOk={() => {}}
          onCancel={this.hideModal}
        >
          <Form>
            <Form.Item>
              <Input
                value={"123"}
                onChange={e => {}}
                placeholder="请输入你要进行的任务"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  }
}

function App() {
  return (
    <Layout id="task">
      <Header theme="light">
        <h3 className="title">任务清单</h3>

        <span className="logout">
          退出登录
          <Icon className="logout-icon" type="logout" />
        </span>
      </Header>

      <LoadMoreList type="running" />

      <LoadMoreList type="done" />
    </Layout>
  );
}

export default App;
