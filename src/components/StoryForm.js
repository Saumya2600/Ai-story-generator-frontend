import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import '../styles/StoryForm.css';

function StoryForm(props) {
  const { onStoryGenerated } = props;
  const auth = getAuth();
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    genre: 'fantasy',
    characters: [''],
    plot: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const genres = ['fantasy', 'sci-fi', 'mystery', 'adventure', 'horror'];

  // Fetch authenticated user's ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setError('User not authenticated.');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCharacterChange = (index, value) => {
    const newCharacters = [...formData.characters];
    newCharacters[index] = value;
    setFormData((prev) => ({ ...prev, characters: newCharacters }));
  };

  const addCharacter = () => {
    setFormData((prev) => ({
      ...prev,
      characters: [...prev.characters, ''],
    }));
  };

  const removeCharacter = (index) => {
    setFormData((prev) => ({
      ...prev,
      characters: prev.characters.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError('User not authenticated.');
      return;
    }

    if (formData.characters.some((c) => !c.trim()) || !formData.plot.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/generate-story', {
        user_id: userId,
        genre: formData.genre,
        characters: formData.characters.filter((c) => c.trim()),
        plot: formData.plot,
      });
      onStoryGenerated(response.data.story);
    } catch (err) {
      setError('Failed to generate story: ' + err.message);
      console.error('Story generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'form-container fade-in' },
    React.createElement('h2', null, 'Create Your Story'),
    error && React.createElement('p', { className: 'error' }, error),
    React.createElement(
      'form',
      { onSubmit: handleSubmit },
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', null, 'Genre'),
        React.createElement(
          'select',
          { name: 'genre', value: formData.genre, onChange: handleInputChange },
          genres.map((g) =>
            React.createElement(
              'option',
              { key: g, value: g },
              g.charAt(0).toUpperCase() + g.slice(1)
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', null, 'Characters'),
        formData.characters.map((char, index) =>
          React.createElement(
            'div',
            { key: index, className: 'character-group' },
            React.createElement('input', {
              type: 'text',
              value: char,
              onChange: (e) => handleCharacterChange(index, e.target.value),
              placeholder: `Character ${index + 1}`,
            }),
            formData.characters.length > 1 &&
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: () => removeCharacter(index),
                  className: 'button button-danger',
                },
                'Remove'
              )
          )
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: addCharacter, className: 'button' },
          'Add Character'
        )
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', null, 'Plot'),
        React.createElement('textarea', {
          name: 'plot',
          value: formData.plot,
          onChange: handleInputChange,
          placeholder: 'Enter the plot',
          rows: '4',
        })
      ),
      React.createElement(
        'button',
        { type: 'submit', disabled: loading, className: 'button', style: { width: '100%' } },
        loading ? 'Generating...' : 'Generate Story'
      )
    )
  );
}

export default StoryForm;