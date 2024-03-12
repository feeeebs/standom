import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Button } from "react-bootstrap";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  //${window.location.origin}
  return (
    <Button variant="success" 
      onClick={() => loginWithRedirect({ 
        redirect_uri: `${window.location.origin}/dashboard`
        })
      }>
        Log In or Sign Up
      </Button>
  );
};

export default LoginButton;