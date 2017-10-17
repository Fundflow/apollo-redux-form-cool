import React, { Component } from 'react';

import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { ApolloProvider, graphql, gql } from 'react-apollo'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'

import {
  apolloForm
} from '@fundflow/apollo-redux-form';

import {
  introspectionQuery as introspectionQueryDefinition,
  buildClientSchema,
  printSchema,
} from 'graphql';

import 'antd/dist/antd.css';

import {
  Col,
  Row,
  Spin,
  Input,
  Button,
  Form,
} from 'antd';

const networkInterface = createNetworkInterface({ uri: '__SIMPLE_API_ENDPOINT__' });

const client = new ApolloClient({
  networkInterface,
  addTypename: false,
});


const store = createStore(
  combineReducers({
    form: formReducer,
    apollo: client.reducer()
  }),
  {},
  compose(
    applyMiddleware(client.middleware()),
    (typeof window['__REDUX_DEVTOOLS_EXTENSION__'] !== 'undefined') ? window['__REDUX_DEVTOOLS_EXTENSION__']() : (f: any) => f,
  )
);

const createPost = gql`
  mutation createPost($title: String!, $content: String!, $author: PostauthorUser) {
    createPost(title: $title, content: $content, author: $author) {
      id
    }
  }`;

const allPosts = gql`
  query allPosts {
    allPosts {
      id
      title
      content
      author {
        name
        surname
      }  
    }
  }`;

const introspectionQuery = gql(introspectionQueryDefinition);

const CreatePostFormFromSchema = graphql( introspectionQuery )((props) => {
  const {
    data: {
      loading,
      __schema
    },
    onSubmitSuccess,
  } = props;
  let CreatePostForm;
  if (__schema) {
    CreatePostForm = apolloForm(createPost, {
      schema: gql(printSchema(buildClientSchema(props.data))),
      renderers: {
        String: (props) => <Form.Item><Input placeholder={props.label} {...props.input} /></Form.Item>,
      },
      customFields: {
        content: (props) => <Form.Item><Input.TextArea placeholder="Content" {...props.input} /></Form.Item>,
        // XXX hide foreignKeys produced by graph.cool
        'author.postsIds': (props) => <div />,
        'author.posts': (props) => <div />
      },
      renderForm: (fields, props) => {
        const { handleSubmit, invalid } = props;
        return (
          <Form >
            {fields}
            <Button onClick={handleSubmit} type="primary" disabled={invalid}>Send</Button>
          </Form>
        );
      },
      destroyOnUnmount: false
    });
  }
  return(
    <div>{
      loading?
        <Spin />
        : <CreatePostForm onSubmitSuccess={onSubmitSuccess} />
    }</div>
  );
});

class PostList extends Component {
  render() {
    const {
      data: {
        loading,
        allPosts,
      }
    } = this.props;
    return (
      <div>
        {
          loading ? <Spin /> : allPosts.map(
            (post) => <div key={post.id}>
              <h3>{post.title} by {post.author.name} {post.author.surname[0]}.</h3>
              <p>{post.content}</p>
              <hr/>
            </div>
          )
        }
      </div>
    );
  }
}

class PostListWithForm extends Component {
  render() {
    return (
      <Row gutter={12}>
        <Col span={12}>
          <h2>Write post</h2>
          <CreatePostFormFromSchema onSubmitSuccess={this.props.data.refetch} />
        </Col>
        <Col span={12}>
          <h2>Your posts</h2>
          <PostList {...this.props} />
        </Col>
      </Row>
    );
  }
}

const PostListWithData = graphql( allPosts )( PostListWithForm );

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <PostListWithData />
        </Provider>
      </ApolloProvider>
    );
  }
}

export default App;
