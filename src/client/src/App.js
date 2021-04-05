import React, { useState } from 'react';
import { Container, Grid, Box, TextField, Typography, Button, Dialog, DialogContent, Snackbar} from '@material-ui/core';
import { Alert } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core/styles';
import { io } from "socket.io-client";

const useStyles = makeStyles({
  bodyContainer: {
    height: "100vh"
  },
  mainContainer: {
    height: "100%"
  },
  titleContainer: {
    height: "10%"
  },
  msgContainer: {
    height: "70%"
  },
  txtContainer: {
    height: "20%"
  },
  ulNoBullet: {
    listStyleType: "none"
  }
})

let clientWs;
const initWs = (username, callbacks) => {
  clientWs = io("http://localhost:8080");
  clientWs.on("connect", () => {
    console.log("WS connected");
    clientWs.emit("register", {username});
    clientWs.emit("getUsers");
    clientWs.emit("getHistory");
  })

  clientWs.on("updateMessage", (data) => {
    callbacks["updateMessages"](data);
  })

  clientWs.on("updateUsers", (data) => {
    callbacks["updateUsers"](data)
  })

  clientWs.on("userConnected", (data) => {
    callbacks["userConnected"](data)
  })

  clientWs.on("userDisconnected", (data) => {
    callbacks["userDisconnected"](data)
  })
}

function App() {
  const classes = useStyles();
  // the username currently online
  const [username, setUsername] = useState('');
  // the temp storage for sending new message
  const [newText, setNewText] = useState('');
  // the history of messages
  const [messages, setMessages] = useState([]);
  // the username of connected users
  const [users, setUsers] = useState([]);
  // app startup modal, prompt user for username
  const [showModal, setShowModal] = useState(true);
  // simple error checking, show error if user click connect without specifying username
  const [usernameError, setUsernameError] = useState('');
  // snackbar notification
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarData, setSnackbarData] = useState({});

  // handler for event userConnected
  const userConnected = (data) => {
    // dont show alert for own username
    if (data.connected.username != username) {
      setUsers(data.newUsers);
      setSnackbarData({
        msg: `${data.connected.username} connected.`,
        variant: "success"
      });
      setShowSnackbar(true);
    }
  }

  // handler for event userDisconnected
  const userDisconnected = (data) => {
    setUsers(data.newUsers);
    setSnackbarData({
      msg: `${data.disconnected.username} disconnected.`,
      variant: "info"
    });
    setShowSnackbar(true);
  }

  // connect to WS, should be called on connect
  const connectWs = () => {
    setUsernameError('');

    if (username) {
      initWs(username, {
        updateMessages: setMessages,
        updateUsers: setUsers,
        userConnected: userConnected,
        userDisconnected: userDisconnected
      });

      setShowModal(false);
    }
    else {
      setUsernameError('Please enter a username');
    }
  }

  // handler for new message (when user click send)
  const handleNewMessage = () => {
    if (newText) {
      clientWs.emit("newMessage", {content: newText});
      setNewText('');
    }
  }

  // send text if user pressed enter
  const handleEnterNewNext = (e) => {
    if (e.key == "Enter") {
      handleNewMessage();
    }
  }

  return (
    <Container className={classes.bodyContainer}>
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        disableBackdropClick={true}
      >
        <DialogContent>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <TextField fullWidth variant="outlined" placeholder="Enter username" onChange={(e) => setUsername(e.target.value)}></TextField>
              <Typography variant="subtitle2">{usernameError}</Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={() => connectWs()}>Connect</Button>
            </Grid>
          </Grid>
          
        </DialogContent>
      </Dialog>
      <Snackbar open={showSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowSnackbar(false)}
        >
            <Alert onClose={() => setShowSnackbar(false)} severity={snackbarData.variant}>
                {snackbarData.msg}
            </Alert>
        </Snackbar>
      <Grid className={classes.mainContainer} container
        spacing={2}
        direction="row">
          <Grid className={classes.titleContainer} container item xs={12} justify="center">
            <Typography variant="h5" component="h1">Simple chat app</Typography>
          </Grid>
          <Grid className={classes.msgContainer} container item xs={12} justify="space-between">
            <Box width="75%">
              <ul className={classes.ulNoBullet}>
                {
                  messages.map((msg, idx) => {
                    return (
                      <li key={idx}>{msg.username} : {msg.content}</li>
                    )
                  })
                }
              </ul>
            </Box>
            <Box width="20%">
              <Typography variant="h6">Online Users</Typography>
              <ul>
                {users.map((user, idx) => {
                  return (
                    <li key={idx}>{user.username}</li>
                  )
                })}
                
              </ul>
            </Box>
          </Grid>
          <Grid className={classes.txtContainer} item xs={12}>
            <Grid container direction="row">
                <Box flexGrow={1}>
                  <TextField variant="outlined" fullWidth placeholder="Enter message" value={newText} onKeyPress={(e) => handleEnterNewNext(e)} onChange={(e) => setNewText(e.target.value)}/>
                </Box>
                <Button variant="contained" color="primary" onClick={() => handleNewMessage()}>Send</Button>
            </Grid>
          </Grid>
      </Grid>
    </Container>
  );
}

export default App;
