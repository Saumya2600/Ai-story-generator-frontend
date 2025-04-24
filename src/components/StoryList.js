import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import '../styles/StoryList.css';

function StoryList() {
  const auth = getAuth();
  const [userId, setUserId] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [readingStoryId, setReadingStoryId] = useState(null);
  const [expandedStoryId, setExpandedStoryId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchStories = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:5000/api/stories/${userId}`);
        setStories(response.data);
      } catch (err) {
        setError('Failed to fetch stories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [userId]);

  const handleReadAloud = (story, storyId) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(story);
    utterance.lang = 'en-US';
    utterance.onend = () => setReadingStoryId(null);
    speechSynthesis.speak(utterance);
    setReadingStoryId(storyId);
  };

  const handleStopReading = () => {
    speechSynthesis.cancel();
    setReadingStoryId(null);
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await axios.delete(`http://localhost:5000/api/stories/${storyId}`, {
        data: { userId } // Send userId in the request body
      });
      setStories((prev) => prev.filter((story) => story._id !== storyId));
    } catch (err) {
      setError('Failed to delete story.');
      console.error(err);
    }
  };

  const toggleExpand = (storyId) => {
    setExpandedStoryId((prev) => (prev === storyId ? null : storyId));
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!userId) return null;

  return React.createElement(
    'div',
    { className: 'story-list' },
    React.createElement('h2', { className: 'fade-in' }, 'Your Saved Stories'),
    loading && React.createElement('p', { className: 'fade-in' }, 'Loading stories...'),
    error && React.createElement('p', { className: 'error fade-in' }, error),
    stories.length === 0 && !loading && !error && React.createElement('p', { className: 'fade-in' }, 'No stories found.'),
    stories.map((story, index) =>
      React.createElement(
        'div',
        { key: story._id, className: 'story-item', style: { animationDelay: `${index * 0.1}s` } },
        React.createElement(
          'div',
          { className: 'story-summary', onClick: () => toggleExpand(story._id) },
          React.createElement('p', null, story.genre.charAt(0).toUpperCase() + story.genre.slice(1)),
          React.createElement('p', { className: 'snippet' }, truncateText(story.generated_story, 50))
        ),
        React.createElement(
          'div',
          { className: `story-details ${expandedStoryId === story._id ? 'open' : ''}` },
          React.createElement('p', null,
            React.createElement('strong', null, 'Genre: '),
            story.genre
          ),
          React.createElement('p', null,
            React.createElement('strong', null, 'Characters: '),
            story.characters.join(', ')
          ),
          React.createElement('p', null,
            React.createElement('strong', null, 'Plot: '),
            story.plot
          ),
          React.createElement('p', null, story.generated_story),
          React.createElement(
            'div',
            { className: 'button-container' },
            React.createElement(
              'button',
              {
                onClick: () =>
                  readingStoryId === story._id
                    ? handleStopReading()
                    : handleReadAloud(story.generated_story, story._id),
                className: `button ${readingStoryId === story._id ? 'button-stop' : ''}`,
              },
              readingStoryId === story._id ? 'Stop Reading' : 'Read Aloud'
            ),
            React.createElement(
              'button',
              {
                onClick: () => handleDeleteStory(story._id),
                className: 'button button-delete',
              },
              'Delete'
            )
          )
        )
      )
    )
  );
}

export default StoryList;