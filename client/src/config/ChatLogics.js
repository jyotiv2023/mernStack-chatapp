export const getSender = (loggedUser, users) => {
  if (users && users.length >= 1) {
    // Ensure that users is defined and contains at least two elements
    if (users[0]?._id === loggedUser?._id) {
      return users[1].name;
    } else {
      return users[0].name;
    }
  } else {
    return "Unknown"; // Handle the case when users array is undefined or has insufficient elements
  }
};

export const getSenderFullDetails = (loggedUser, users) => {
  return users[0]?._id === loggedUser?._id ? users[1] : users[0];
};

export const isSameSender = (messages, currentMessage, index, userId) => {
  return (
    index < messages.length - 1 &&
    (messages[index + 1].sender._id !== currentMessage.sender._id ||
      messages[index + 1].sender._id === undefined) &&
    messages[index].sender._id !== userId
  );
};

export const isLastMessage = (messages, index, userId) => {
  return (
    index === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameSenderMargin = (messages, currentMessage, index, userId) => {
  if (
    index < messages.length - 1 &&
    messages[index + 1].sender._id === currentMessage.sender._id &&
    messages[index].sender._id !== userId
  )
    return 33;
  else if (
    (index < messages.length - 1 &&
      messages[index + 1].sender._id !== currentMessage.sender._id &&
      messages[index].sender._id !== userId) ||
    (index === messages.length - 1 && messages[index].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameUser = (messages, currentMessage, index) => {
  return (
    index > 0 && messages[index - 1].sender._id === currentMessage.sender._id
  );
};
