import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useSquid, useCollection } from '@squidcloud/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from '../routes/Homepage';
import ErrorPage from '../routes/ErrorPage';
import Dashboard from '../routes/Dashboard';
import PrivateRoute from './PrivateRoute';
import Profile from '../routes/Profile';
import UpdateProfile from '../routes/UpdateProfile';
import AddNewLyrics from '../routes/AddNewLyrics';
import { useDispatch, useSelector } from 'react-redux';
import { updateAll, updateEmail, updateName } from '../utilities/Redux/userSlice';

function App() {

  // Get user token
  const { isLoading, user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { setAuthProvider } = useSquid();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLoading && user) {
      setAuthProvider({
        integrationId: 'auth0Id',
        getToken: () => user && getAccessTokenSilently(),
      });
    }
  }, [isLoading, user, getAccessTokenSilently, setAuthProvider]);

  const usersCollection = useCollection('users', 'postgres_id'); // Reference to users collection in DB

  // ***** TO DO EVENTUALLY ***** -- update to only have the user information query/update once after login instead of every time page loads
  // ^^ will setting up the session stuff fix that?

    // Store initial user info in Redux based on Auth0 default values -- values will update later if user has overwritten this in DB
    useEffect(() => {
      if (isAuthenticated && user) {
        console.log('Authenticated and user stuff running')
        dispatch(updateAll({
          id: user.sub,
          email: user.email,
          name: user.name
        }))
      }
    }, [dispatch, isAuthenticated, user]);
    
    // Store initial user info in variables to use here
    const userInformation = useSelector(state => state.user.userInfo);
    const { id, email, name } = userInformation;
  

    // Check to see if current user exists in DB - triggers other functions to update Redux, insert new users into DB
    useEffect(() => {
      if (id) {
        console.log('doop');
        (async () => {
          const doesUserExist = await userExists();
          // console.log('does the user exist? ', doesUserExist);
          
          if (doesUserExist) {
            // if user exists in DB, update state with the stored information
            updateUserInfo();
          }
          if (!doesUserExist) {
              // console.log('User does not exist - about to run insertUser');
            // if user doesn't exist in DB yet, insert them into the DB
            insertNewUser();
          }
        })();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);


    // Function to check if user file exists in the DB
    const userExists = async () => {
      const userDoc = await usersCollection
      .doc({ id: id })
      .snapshot();
      // console.log('userQuery during userExists: ', userDoc);
      if (userDoc) {
        // if the user is in the DB, return true
        return true;
      }
      else {
        // if the user is not in the DB, return false
        return false;
      }
  };

    // Function to query Postgres for user data and update user info stored in Redux
    const updateUserInfo = async () => {
      try {
        // console.log('running updateUserInfo function')
        const userById = await usersCollection
            .query()
            .where('id', '==', id)
            .snapshot();
  
        for (const docRef of userById) {
            // console.log('name during updateUserInfo: ', docRef.data.name);
            // console.log('email during updateUserInfo: ', docRef.data.email);
            dispatch(updateEmail(docRef.data.email));
            dispatch(updateName(docRef.data.name));
        }
      } catch (error) {
        console.error('Error in updateUserInfo: ', error);
      }     
    };


// Function to insert data into Postgres for new user
const insertNewUser = async () => {
  console.log("Running inserNewUser");
  console.log("Form data being inserted: ", userInformation);
  await usersCollection.doc({ id: id }).insert({
      id: id,
      name: name,
      email: email,
  })
      .then(() => console.log("New user inserted into DB successfully"))
      .catch((err) => console.error("Error inserting new user into DB: ", err));
}



  // // Update userInfo when DB updates
  // const handleUserInfoUpdate = (newData) => {
  //   setUserInfo((prevUserInfo) => ({
  //     ...prevUserInfo,
  //     newData,
  //   }));
  //   queryUser();
  // };

  // useEffect(() => {
  //   if (!isLoading && user) {
  //     queryUser();
  //     //console.log('User info at end of queryUser function: ', userInfo);
  //   }
  // }, [isLoading, user]);



  // Routing
  // TO DO -- properly update default route based on authentication
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Homepage />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/dashboard",
      element: <PrivateRoute><Dashboard userInfo={userInformation} /></PrivateRoute>,
    },
    {
      path: "/profile",
      element: <PrivateRoute><Profile userInfo={userInformation} /></PrivateRoute>,
    },
    {
      path: "/update-profile",
      element: <PrivateRoute><UpdateProfile userInfo={userInformation} /></PrivateRoute>,
    },
    {
      path: "/add-lyrics",
      element: <PrivateRoute><AddNewLyrics userInfo={userInformation} /></PrivateRoute>,
    },
  ]);


  return (
    <RouterProvider router={router} />
  )
}

export default App
