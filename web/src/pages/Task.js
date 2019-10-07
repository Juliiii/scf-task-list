import React from 'react';
import {
  Layout,
  Icon,
  List,
  Button,
  Skeleton,
  Card
} from 'antd';
import './Task.css'

const { Header } = Layout;


class LoadMoreList extends React.Component {
  state = {
    initLoading: true,
    loading: false,
    data: [],
    list: [],
  };

  componentDidMount() {
    this.getData(res => {
      this.setState({
        initLoading: false,
        data: [{A:"今天要好好学习"}],
        list: [{A:"今天要好好学习"}],
      });
    });
  }

  getData = callback => {
    callback([])
  };

  onLoadMore = () => {
    this.setState({
      loading: true,
      list: this.state.data.concat([...new Array(10)].map(() => ({ loading: true, name: {} }))),
    });
    this.getData(res => {
      const data = this.state.data.concat(res);
      this.setState(
        {
          data,
          list: data,
          loading: false,
        },
        () => {
          // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
          // In real scene, you can using public method of react-virtualized:
          // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
          window.dispatchEvent(new Event('resize'));
        },
      );
    });
  };

  render() {
    const { type } = this.props
    const { initLoading, loading, list } = this.state;
    const loadMore =
      !initLoading && !loading ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            height: 32,
            lineHeight: '32px',
          }}
        >
          <Button onClick={this.onLoadMore}>loading more</Button>
        </div>
      ) : null;


    const isRunning = type === 'running'
    return (
      <Card className="task-body">
        {isRunning &&
          <div style={{ textAlign: 'left', marginBottom: 10 }}>
            <Button type="primary">
              Add
            </Button>
          </div>
        }
        <h3 className="task-body-title">{isRunning ? '进行中的任务' : '已完成的任务'}</h3>
        <List
          className="demo-loadmore-list"
          loading={initLoading}
          itemLayout="horizontal"
          loadMore={loadMore}
          dataSource={list}
          renderItem={item => (
            <List.Item
              actions={[isRunning ? <a href="https://ant.design" key="list-loadmore-edit">edit</a> : null, <a href="https://ant.design" key="list-loadmore-more">delete</a>].filter(o => !!o)}
            >
              <Skeleton avatar title={false} loading={false} active>
                <List.Item.Meta
                  title={<div style={{ textAlign: 'left' }}>{item.A}</div>}
                />
              </Skeleton>
            </List.Item>
          )}
        />
      </Card>
    );
  }
}

function App() {
  return (
    <Layout id="task">
      <Header theme="light">
        <h3 className="title">
          任务清单
        </h3>

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
