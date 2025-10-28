const Newsletter = require('../models/NewsLetter');
const emailService = require('../emailService/EmailService');

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await Newsletter.findOne({ email });

    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ message: 'Email already subscribed' });
      }

      existing.isActive = true;
      existing.subscriptionDate = new Date();
      await existing.save();

      await Promise.all([
        emailService.sendNewsletterSubscriptionNotification({ email }),
        emailService.sendWelcomeEmailToSubscriber({ email })
      ]);

      return res.status(200).json({
        message: 'Newsletter subscription reactivated successfully',
        subscriber: existing
      });
    }

    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    await Promise.all([
      emailService.sendNewsletterSubscriptionNotification({ email }),
      emailService.sendWelcomeEmailToSubscriber({ email })
    ]);

    res.status(201).json({ message: 'Newsletter subscription successful', subscriber: newSubscriber });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Error subscribing to newsletter', error: error.message });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ message: 'Email not found in subscription list' });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.status(200).json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    res.status(500).json({ message: 'Error unsubscribing from newsletter', error: error.message });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const subscribers = await Newsletter.find({ isActive: true })
      .sort({ subscriptionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Newsletter.countDocuments({ isActive: true });

    res.status(200).json({
      subscribers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Error fetching subscribers', error: error.message });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers
};