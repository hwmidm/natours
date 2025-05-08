const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require(`./../../models/tourModels`);
const User = require(`./../../models/userModel`);
const Review = require(`./../../models/reviewModel`);

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.LocalDatabase)
  .then(() => console.log('DB connected successfully'))
  .catch(err => console.log('DB connection error:', err));

//   ReadFile

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// import Data into DB

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data is successfully loaded !!!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data is Deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--deleted') {
  deleteData();
}
console.log(process.argv);
