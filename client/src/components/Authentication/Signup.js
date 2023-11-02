import {
  FormControl,
  VStack,
  Input,
  FormLabel,
  InputGroup,
  InputRightElement,
  Button,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const Signup = () => {
  const [fieldValue, setFieldValue] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    picture: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const history = useHistory();

  const handleInputChange = (e) => {
    setFieldValue({ ...fieldValue, [e.target.name]: e.target.value });
  };
  // const showPasswordHandler = () => {
  //   setShowPass(!showPass);
  // };
  const postDetails = async (picture) => {
    setLoading(true);
    if (picture === undefined) {
      toast({
        title: "Please upload the image",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (
      picture.type === "image/jpeg" ||
      picture.type === "image/png" ||
      picture.type === "image/jpg"
    ) {
      const data = new FormData();
      data.append("file", picture);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "jyoti-learning");
      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/jyoti-learning/image/upload",
          data
        );
        if (response.status === 200 || response.status === 201) {
          setFieldValue({
            ...fieldValue,
            picture: response.data.url.toString(),
          });
          setLoading(false);
        } else {
          console.error("Request failed with status:", response.status);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    } else {
      toast({
        title: "Please upload the image",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  const submitHandler = async () => {
    setLoading(true);
    if (
      !fieldValue.name ||
      !fieldValue.email ||
      !fieldValue.password ||
      !fieldValue.confirmPassword
    ) {
      toast({
        title: "Please fill in all the details",
        status: "warning",
        duration: 3000,
        inClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    if (fieldValue.password !== fieldValue.confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "warning",
        duration: 3000,
        inClosable: true,
        position: "bottom",
      });

      return;
    }
    console.log(fieldValue);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post("/api/user", { ...fieldValue }, config);
      console.log(data);
      toast({
        title: "Registration Successfull",
        status: "success",
        duration: 3000,
        inClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        inClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack>
      <FormControl id="fname" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter your name"
          name="name"
          value={fieldValue.name}
          onChange={handleInputChange}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter your email"
          type="email"
          name="email"
          value={fieldValue.email}
          onChange={handleInputChange}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            placeholder="Enter your password"
            type={showPass ? "text" : "password"}
            name="password"
            value={fieldValue.password}
            onChange={handleInputChange}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.7rem" size="sm" onClick={() => setShowPass(!showPass)}>
              {showPass ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirmPassword" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            placeholder="ReEnter your password"
            type={showPass ? "text" : "password"}
            name="confirmPassword"
            value={fieldValue.confirmPassword}
            onChange={handleInputChange}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.7rem" size="sm" onClick={() => setShowPass(!showPass)}>
              {showPass ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="picture">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          accept="image/*"
          p={1.5}
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign up
      </Button>
    </VStack>
  );
};

export default Signup;
