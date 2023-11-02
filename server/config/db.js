import mongoose from "mongoose";

const DbConnection = async () => {
  const URL = process.env.MONGO_URI;
  try {
    const connectDb = await mongoose.connect(URL, { useNewUrlParser: true });
    console.log(
      `Database connected successfully : ${connectDb.connection.host}`
    );
  } catch (error) {
    console.log(`Error while connecting to the database, ${error.message}`);
    process.exit();
  }
};

export default DbConnection;
