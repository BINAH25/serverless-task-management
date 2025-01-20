import { AuthProvider } from "react-oidc-context";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_Ow8e4f5yr",
  client_id: "39hbuk21og9eem43kqcbjahntj",
  redirect_uri: "https://main.ddd5qcl8obvzi.amplifyapp.com/tasks",
  response_type: "code",
  scope: "email openid phone",
};


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)

