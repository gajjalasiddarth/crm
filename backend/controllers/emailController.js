const Email = require('../models/Email');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});
exports.getEmails = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, direction, relatedDoc } = req.query;
    const query = { createdBy: req.user.id };
    if (status)    query.status = status;
    if (direction) query.direction = direction;
    if (relatedDoc) query['relatedTo.document'] = relatedDoc;

    const [emails, total] = await Promise.all([
      Email.find(query).populate('createdBy', 'name email').sort('-createdAt').skip((page - 1) * +limit).limit(+limit),
      Email.countDocuments(query),
    ]);
    res.json({ success: true, count: emails.length, total, pages: Math.ceil(total / limit), data: emails });
  } catch (err) { next(err); }
};

exports.getEmail = async (req, res, next) => {
  try {
    const email = await Email.findById(req.params.id).populate('createdBy', 'name email');
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    res.json({ success: true, data: email });
  } catch (err) { next(err); }
};

exports.createDraft = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    req.body.from = req.user.email;
    req.body.status = 'draft';
    const email = await Email.create(req.body);
    res.status(201).json({ success: true, data: email });
  } catch (err) { next(err); }
};

exports.sendEmail = async (req, res, next) => {
  try {
    const emailDoc = await Email.findById(req.params.id);
    if (!emailDoc) return res.status(404).json({ success: false, message: 'Email not found' });

    await transporter.sendMail({
      from:    `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to:      emailDoc.to.join(', '),
      cc:      emailDoc.cc?.join(', '),
      subject: emailDoc.subject,
      html:    emailDoc.body,
    });

    emailDoc.status = 'sent';
    emailDoc.sentAt = Date.now();
    await emailDoc.save();
    res.json({ success: true, data: emailDoc });
  } catch (err) {
    if (req.params.id) {
      await Email.findByIdAndUpdate(req.params.id, { status: 'failed' });
    }
    next(err);
  }
};

exports.composeAndSend = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    req.body.from = req.user.email;
    req.body.status = 'draft';
    const emailDoc = await Email.create(req.body);

    await transporter.sendMail({
      from:    `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to:      emailDoc.to.join(', '),
      cc:      emailDoc.cc?.join(', '),
      subject: emailDoc.subject,
      html:    emailDoc.body,
    });

    emailDoc.status = 'sent';
    emailDoc.sentAt = Date.now();
    await emailDoc.save();
    res.status(201).json({ success: true, data: emailDoc });
  } catch (err) { next(err); }
};

exports.deleteEmail = async (req, res, next) => {
  try {
    await Email.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Email deleted' });
  } catch (err) { next(err); }
};
