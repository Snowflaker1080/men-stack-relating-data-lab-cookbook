const express = require('express');
const router = express.Router( { mergeParams: true }); // allows access to :userId from parent route
const User = require(`../models/user.js`);

// INDEX: GET /users/:userId/foods - listing pantry items
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    const justAdded = req.query.success === 'true';

    res.render(`foods/index`, { user, justAdded, userId });
    } catch (err) {
        console.error('Error fetching pantry items', err);
        res.redirect(`/`);
    }
});

// NEW FORM: GET /users/:userId/foods/new - Show the form to add a new food item
router.get('/new', (req, res) => {
    const userId = req.session.userId;
    res.render('foods/new', { userId });
});

// CREATE: POST /user/:userId/foods - add item to pantry
router.post('/', async (req, res) => {
  try {
    const userId = req.session.userId; // get user from session
    const user = await User.findById(userId);

    if (!user) {
        console.error("User not found in session");
        return res.redirect('/');
    }

    user.pantry.push({ name: req.body.name });
    await user.save();
    
    res.redirect(`/users/${userId}/foods?success=true`);
  } catch (err) {
    console.error("Error saving food item", err);
    res.redirect('/');
  }
});

// EDIT: GET /users/:userId/foods/:itemId/edit
router.get('/:itemId/edit', async (req, res) => {
  try {
    const userId = req.session.userId;
    const itemId = req.params.itemId;

    const user = await User.findById(userId);
    if (!user) return res.redirect('/');

    const foodItem = user.pantry.id(itemId);
    if (!foodItem) return res.redirect(`/users/${userId}/foods`);

    res.render('foods/edit', { userId, foodItem });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.redirect('/');
  }
});

// UPDATE: PUT /users/:userId/foods/:itemId
router.put('/:itemId', async (req, res) => {
  try {
    const userId = req.session.userId;
    const itemId = req.params.itemId;

    const user = await User.findById(userId);
    if (!user) return res.redirect('/');

    const foodItem = user.pantry.id(itemId);
    if (!foodItem) return res.redirect(`/users/${userId}/foods`);

    // Update the item using .set()
    foodItem.set({ name: req.body.name });

    await user.save();
    res.redirect(`/users/${userId}/foods`);
  } catch (err) {
    console.error('Error updating food item:', err);
    res.redirect('/');
  }
});

// DELETE: /users/:userId/foods/:itemId - remove food item from pantry
router.delete('/:itemId', async (req, res) => {
  try {
    const userId = req.session.userId;
    const itemId = req.params.itemId;

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found.');
      return res.redirect('/');
    }

    // Remove the item by ID from the embedded pantry array
    user.pantry.id(itemId).deleteOne();
    await user.save();

    res.redirect(`/users/${userId}/foods`);
  } catch (err) {
    console.error('Error deleting food item:', err);
    res.redirect('/');
  }
});

module.exports = router;