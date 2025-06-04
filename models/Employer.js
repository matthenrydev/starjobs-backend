const mongoose = require("mongoose");
const User = require("./User");

const employerSchema = new mongoose.Schema({
  companyLogo: { type: String },
  panNumber: { type: String },
  establishedDate: { type: Date },
  industryType: { type: String },
  companySize: { type: String },
  address: { type: String },
  telephone: { type: String },
  description: { type: String },
});

const Employer = User.discriminator("employer", employerSchema);
module.exports = Employer;
