const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Patient = require('../models/patient');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const fs = require('fs');

exports.getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.find()
  res.status(200).json({ success: true, data: patient });
});
exports.getPatientById = asyncHandler(async (req, res) => {
    const patient = await Patient.find({_id:req.params.id})
    res.status(200).json({ success: true, data: patient });
  });
exports.getPatientBySIN = asyncHandler(async (req, res) => {
  const patient = await Patient.find({SIN:req.params.SIN})
  res.status(200).json({ success: true, data: patient });
});
exports.addPatient = asyncHandler(async (req, res) => {
  fs.writeFile(req.files[0].originalname, req.files[0].buffer, (err) => {
    if (err) {
        console.log('Error: ', err);
        res.status(500).send('An error occurred: ' + err.message);
    } else {
      req.body.depositSlip = upload;
    }
});
  const { profileNo, SIN, title, firstName, lastName, gender, dob, phoneNumber, email, country, city, address,
    otherDetails, paymentMethod, depositAmount, amountReceived, bankName, depositorName, depositSlip,
    insuranceId, coverageDetails, coverageTerms, payment } = req.body;
  const patient = await Patient.create({
    profileNo,
    SIN,
    title,
    firstName,
    lastName,
    gender,
    dob,
    phoneNumber,
    email,
    country,
    city,
    address,
    otherDetails,
    paymentMethod,
    depositAmount,
    amountReceived,
    bankName,
    depositorName,
    depositSlip,
    insuranceId,
    coverageDetails,
    coverageTerms,
    payment
  });
  res.status(200).json({ success: true, data: patient });
});

exports.deletePatient = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const patient = await Patient.findById(_id);
  if (!patient) {
    return next(
      new ErrorResponse(`Patient not found with id of ${_id}`, 404)
    );
  }
  await Patient.deleteOne({ _id: _id });
});

exports.updatePatient = asyncHandler(async (req, res, next) => {
  const { _id } = req.body;
  let patient = await Patient.findById(_id);
  if (!patient) {
    return next(
      new ErrorResponse(`Patient not found with id of ${_id}`, 404)
    );
  }
  patient = await Patient.updateOne({ _id: _id }, req.body);
  res.status(200).json({ success: true, data: patient });
});