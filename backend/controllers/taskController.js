const Task = require('../models/Task');
const Activity = require('../models/Activity');

exports.getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, type, assignedTo, dueDate, sortBy = 'dueDate', order = 'asc' } = req.query;
    const query = {};
    if (req.user.role === 'sales_rep') query.assignedTo = req.user.id;
    if (status)     query.status = status;
    if (priority)   query.priority = priority;
    if (type)       query.type = type;
    if (assignedTo) query.assignedTo = assignedTo;
    if (dueDate)    query.dueDate = { $lte: new Date(dueDate) };

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email avatar')
        .populate('relatedTo.document')
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .skip((page - 1) * +limit).limit(+limit),
      Task.countDocuments(query),
    ]);
    res.json({ success: true, count: tasks.length, total, pages: Math.ceil(total / limit), data: tasks });
  } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email avatar').populate('createdBy', 'name');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    if (!req.body.assignedTo) req.body.assignedTo = req.user.id;
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    if (req.body.status === 'completed') req.body.completedAt = Date.now();
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedTo', 'name email avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

// @route GET /api/tasks/upcoming
exports.getUpcoming = async (req, res, next) => {
  try {
    const query = { status: { $in: ['todo', 'in_progress'] }, dueDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } };
    if (req.user.role === 'sales_rep') query.assignedTo = req.user.id;
    const tasks = await Task.find(query).populate('assignedTo', 'name avatar').sort('dueDate').limit(10);
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
};
