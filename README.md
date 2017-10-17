Simple proof-of-concept experiment showing how to build forms from a [graph.cool](https://graph.cool) schema.

We followed the [example project](https://github.com/graphcool-examples/react-graphql/tree/master/quickstart-with-apollo) with Apollo.

Project built with [create-react-app](https://github.com/facebookincubator/create-react-app).

# Basic idea

## 1) Define a type with Graph.Cool

```
type User @model {
  id: ID! @isUnique
  name: String!
  surname: String!
  posts: [Post!]! @relation(name: "UserPosts")
}

type Post @model {
  id: ID! @isUnique
  title: String!
  content: String!
  author: User! @relation(name: "UserPosts")
}
```

## 2) Read Graph.Cool schema with introspection

```
import {
  introspectionQuery
} from 'graphql';

import { graphql, gql } from 'react-apollo'

graphql( gql(introspectionQuery) )((props) => {
  const {
    data: {
      loading,
      __schema // graph.cool schema
    }
  } = props;
  return (
    ...  
  )
});
```

## 3) Build form with apollo-redux-form

```
import {
  apolloForm
} from '@fundflow/apollo-redux-form';

CreatePostForm = apolloForm(createPost, {
  schema, // <-- schema read at step 2
});
```