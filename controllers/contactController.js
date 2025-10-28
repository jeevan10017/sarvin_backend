const Contact = require('../models/Contact');
const emailService = require('../emailService/EmailService');

const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required' });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      department: subject
    });

    await newContact.save();

    await emailService.sendContactFormNotification({ name, email, phone, subject, message });

    res.status(201).json({ message: 'Contact form submitted successfully', contact: newContact });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Error submitting contact form', error: error.message });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;

    const submissions = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('respondedBy', 'name email');

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({ message: 'Error fetching contact submissions', error: error.message });
  }
};

const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    contact.status = status;
    if (adminNotes) contact.adminNotes = adminNotes;
    if (['resolved', 'closed'].includes(status)) {
      contact.respondedAt = new Date();
      contact.respondedBy = req.user._id;
    }

    await contact.save();

    res.status(200).json({ message: 'Contact submission updated successfully', contact });
  } catch (error) {
    console.error('Error updating contact submission:', error);
    res.status(500).json({ message: 'Error updating contact submission', error: error.message });
  }
};

// Add these functions to your contactController.js:

const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, department, adminNotes } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    contact.status = status || contact.status;
    contact.priority = priority || contact.priority;
    contact.department = department || contact.department;
    contact.adminNotes = adminNotes || contact.adminNotes;
    
    if (['resolved', 'closed'].includes(status)) {
      contact.respondedAt = new Date();
      contact.respondedBy = req.user?._id;
    }

    await contact.save();

    res.status(200).json({ message: 'Contact submission updated successfully', contact });
  } catch (error) {
    console.error('Error updating contact submission:', error);
    res.status(500).json({ message: 'Error updating contact submission', error: error.message });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    await Contact.findByIdAndDelete(id);

    res.status(200).json({ message: 'Contact submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({ message: 'Error deleting contact submission', error: error.message });
  }
};

module.exports = {
  submitContactForm,
  getAllSubmissions,
  updateSubmissionStatus,
  updateSubmission,
  deleteSubmission
};  