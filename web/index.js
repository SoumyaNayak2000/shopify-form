// @ts-check
import path, { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import mongoose from "mongoose";
import dotenv from "dotenv"

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import { Form } from "./models/form.model.js";
import { Submission } from "./models/submissions.model.js";

dotenv.config()

console.log(process.env.MONGO_URI)

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/formdb');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// GETTING STORE INFORMATION
app.get("/api/store/info", async (req, res) => {
  let storeInfo = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,

  });
  res.status(200).send(storeInfo);
});

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

// READ ALL PRODUCTS
app.get("/api/product/count", async (req, res) => {
  let totalProducts = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(totalProducts);
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

// Save Form Endpoint
app.post("/api/save-form", async (req, res) => {
  try {
    const {formId, formName, fields, storeId } = req.body;
    // Validate input
    if (!formId || !formName || !fields || !storeId) {
      return res.status(400).json({ message: 'Form name, fields, and store ID are required.' });
    }

    // Create a new form document
    const form = new Form({
      formId,
      formName,
      fields,
      storeId,
    });

    // Save the form to the database
    await form.save();

    res.status(201).json({ message: 'Form saved successfully', form });
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Total Forms
app.get('/api/forms/total', async (req, res) => {
  try {
    const totalForms = await Form.countDocuments();
    res.status(200).json({ count: totalForms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/forms/details', async (req, res) => {
  try {
    // Fetch store info from Shopify API
    let storeInfo = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });

    const storeId = storeInfo?.data[0]?.id;
    console.log('Store ID:', storeId);

    // Fetch forms using a simple query
    const forms = await Form.find({ storeId: storeId });

    // Now perform the aggregation
    // const formsCheck = await Form.aggregate([
    //   { $match: { storeId: storeId } },
    //   {
    //     $lookup: {
    //       from: 'submissions',
    //       localField: 'formId',
    //       foreignField: 'formId',
    //       as: 'submissions'
    //     }
    //   },
    //   { $unwind: { path: '$submissions', preserveNullAndEmptyArrays: true } },
    //   {
    //     $project: {
    //       formId: 1,
    //       formName: 1,
    //       totalSubmissions: { $cond: { if: { $isArray: '$submissions' }, then: { $size: '$submissions' }, else: 0 } }
    //     }
    //   }
    // ]);
    
    console.log('Forms fetched using aggregation:', forms);

    res.status(200).json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


//Form Submissions
app.get('/api/submissions', async (req, res) => {
  try {
    let storeInfo = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });
    const storeId = storeInfo?.data[0]?.id;
    const submissions = await Submission.find({ storeId }).populate('formId');

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forms Submitted Today
app.get('/api/forms/today', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const submissionsToday = await Submission.countDocuments({
      submittedAt: { $gte: startOfToday, $lte: endOfToday }
    });

    res.status(200).json({ count: submissionsToday });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//Form Submit
app.post('/api/submit-form', async (req, res) => {
  try {
    const { formId, submissionData } = req.body;
    const storeId = res.locals.shopify.session.shop;

    // Save the submission
    const newSubmission = new Submission({
      formId,
      storeId,
      submissionData
    });

    await newSubmission.save();

    res.status(200).json({ message: 'Form submitted successfully', submission: newSubmission });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Form Delete
app.delete('/api/forms/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    // Delete the form
    await Form.findByIdAndDelete(formId);

    // Optionally, delete related submissions
    await Submission.deleteMany({ formId });

    res.status(200).json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Form Update
app.put('/api/forms/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const { formName, fields } = req.body;

    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      { formName, fields },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Form updated successfully', form: updatedForm });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
