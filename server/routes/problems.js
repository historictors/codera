const express = require('express');
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all problems with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      difficulty,
      category,
      search,
      sort = 'createdAt'
    } = req.query;

    const query = { isPublic: true };

    // Apply filters
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting options
    const sortOptions = {};
    switch (sort) {
      case 'difficulty':
        sortOptions.difficulty = 1;
        break;
      case 'acceptance':
        sortOptions['stats.acceptanceRate'] = -1;
        break;
      case 'submissions':
        sortOptions['stats.totalSubmissions'] = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const problems = await Problem.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'username')
      .select('-testCases -solution');

    const total = await Problem.countDocuments(query);

    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single problem
router.get('/:slug', async (req, res) => {
  try {
    const problem = await Problem.findOne({
      slug: req.params.slug,
      isPublic: true
    }).populate('author', 'username');

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Don't send solution and hidden test cases
    const problemData = problem.toObject();
    delete problemData.solution;
    problemData.testCases = problemData.testCases.filter(tc => !tc.isHidden);

    res.json(problemData);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new problem (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      tags,
      examples,
      constraints,
      testCases,
      starterCode,
      solution
    } = req.body;

    // Create slug from title
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Check if slug already exists
    const existingProblem = await Problem.findOne({ slug });
    if (existingProblem) {
      return res.status(400).json({ message: 'Problem with this title already exists' });
    }

    const problem = new Problem({
      title,
      slug,
      description,
      difficulty,
      category,
      tags,
      examples,
      constraints,
      testCases,
      starterCode,
      solution,
      author: req.user.userId
    });

    await problem.save();

    res.status(201).json({
      message: 'Problem created successfully',
      problem: {
        id: problem._id,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        category: problem.category
      }
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get random problem for arena
router.get('/random/arena', async (req, res) => {
  try {
    const { difficulty = 'Medium' } = req.query;
    
    const count = await Problem.countDocuments({
      difficulty,
      isPublic: true
    });

    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne({
      difficulty,
      isPublic: true
    }).skip(random);

    if (!problem) {
      return res.status(404).json({ message: 'No problems found' });
    }

    res.json(problem);
  } catch (error) {
    console.error('Get random problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;