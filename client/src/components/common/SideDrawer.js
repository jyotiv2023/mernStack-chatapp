import {
  Tooltip,
  Box,
  Badge,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Avatar,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  useToast,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/hooks";
import React, { useEffect, useState } from "react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/chatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserList/UserListItem";
import { getSender } from "../../config/ChatLogics";
const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState();
  const [showBadge, setShowBadge] = useState(true);
  const history = useHistory();
  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in search bar",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
      setSearch("");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the search results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  const accessChat = async (userId) => {
    try {
      setChatLoading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);
      if (!chats.find((chat) => chat._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setChatLoading(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  //storing notif in local storage
  // useEffect(() => {
  //   const storedNotifications =
  //     JSON.parse(localStorage.getItem("notification")) || [];
  //   setNotification(storedNotifications);
  // }, []); // The empty dependency array ensures this code only runs when the component mounts

  useEffect(() => {
    const storedNotifications =
      JSON.parse(localStorage.getItem("notification")) || [];
    const updatedNotifications = [...storedNotifications, ...notification];
    // Remove duplicates by converting to a Set and back to an array
    const newNotif = Array.from(new Set(updatedNotifications));
    try {
      // Attempt to set notifications in local storage
      localStorage.setItem("notification", JSON.stringify(newNotif));
      setNotification(newNotif);
    } catch (error) {
      console.error("Error setting notifications in local storage:", error);
    }
  }, [notification]);

  // Function to remove a notification
  const removeNotification = (notificationId) => {
    const updatedNotifications = notification.filter(
      (notif) => notif._id !== notificationId
    );
    localStorage.setItem("notification", JSON.stringify(updatedNotifications));
    setNotification(updatedNotifications);
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="search users">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px="4px">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Chat time
        </Text>
        <div>
          <Menu>
            <MenuButton
              p={1}
              onClick={() => {
                setShowBadge(false);
              }}
            >
              <BellIcon
                fontSize="2xl"
                m={1}
                // onClick={handleBellIconClick}
                //color={hasUnreadNotifications ? "red.500" : "gray.500"}
                position={"relative"}
              />
              {showBadge && notification && notification.length > 0 && (
                <div className="notification-badge">
                  <span className="badge">{notification.length}</span>
                </div>
              )}
            </MenuButton>
            <MenuList pl={2}>
              {notification?.length && notification.length > 0
                ? notification.map((notif) => (
                    <MenuItem
                      key={notif._id}
                      onClick={() => {
                        setSelectedChat(notif.chat);
                        removeNotification(notif._id);
                        setNotification(
                          notification.filter(
                            (currentNotif) => currentNotif !== notif
                          )
                        );
                      }}
                    >
                      {" "}
                      {notif.chat.isGroupChat
                        ? `New Message received in ${notif.chat.chatName}`
                        : `New message received from ${getSender(
                            user,
                            notif.chat.users
                          )}`}
                    </MenuItem>
                  ))
                : "No new messages"}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.picture}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
            <DrawerBody>
              <Box display="flex" pb={2}>
                <Input
                  placeholder="Search by name or email"
                  mr={2}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={handleSearch}>Go</Button>
              </Box>
              {loading ? (
                <ChatLoading />
              ) : (
                searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))
              )}
              {chatLoading && <Spinner ml="auto" display="flex" />}
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
};

export default SideDrawer;
