import { gql } from "@apollo/client";

// 🔐 Login
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        username
        email
        role
      }
      message
    }
  }
`;

// 📝 Register
export const REGISTER = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
    ) {
      user {
        id
        username
        email
        role
      }
      message
    }
  }
`;

// 👤 Current User
export const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      username
      email
      role
    }
  }
`;

// 🚪 Logout
export const LOGOUT = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;