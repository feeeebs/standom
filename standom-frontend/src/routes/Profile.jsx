
import React from "react";
import { Link } from "react-router-dom";
import { Card } from 'react-bootstrap';
import NavigationBar from "../components/NavigationBar";

const Profile = ({ userInfo }) => {

  if (!userInfo) {
    return <div>Loading ...</div>;
  }

  return (
    <>
      <NavigationBar />
        <h2 className="text-center mb-4">{userInfo.name}'s Profile</h2>
        <Card>
            <Card.Body>
                <div>
                  <strong>Email: {userInfo.email}</strong> 
                </div>
                <div>
                  <strong>Name: {userInfo.name}</strong> 
                </div>
                <Link to="/update-profile" className="btn btn-primary w-100 mt-3">Update Profile</Link>

            </Card.Body>
        </Card>
      </>
  );
};

export default Profile;