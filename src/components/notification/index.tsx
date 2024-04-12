import { useDispatch, useSelector } from "react-redux";
import { Message, hideMessage } from "../../reducers/notificationReducer";
import React from "react";
import { Alert, Snackbar } from "@mui/material";

const Notification = () => {
  const dispatch = useDispatch();
  const messages: Message[] = useSelector(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any) => state.notification.messages
  );
  const handleClose = (id: number) => {
    dispatch(hideMessage(id));
  };

  return (
    <React.Fragment>
      {messages.map((message: Message) => (
        <Snackbar
          key={message.id}
          open
          autoHideDuration={3000}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Alert
            severity="error"
            variant="filled"
            onClose={() => handleClose(message.id)}
          >
            {message.content}
          </Alert>
        </Snackbar>
      ))}
    </React.Fragment>
  );
};

export default Notification;
