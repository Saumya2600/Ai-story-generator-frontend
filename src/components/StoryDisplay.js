import React, { useState } from 'react';
import '../styles/StoryDisplay.css';

function StoryDisplay(props) {
  const { story } = props;
  const [isReading, setIsReading] = useState(false);

  const handleReadAloud = () => {
    if (!story) return;
    speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(story);
    utterance.lang = 'en-US';
    utterance.onend = () => setIsReading(false); // Reset when speech ends
    speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  const handleStopReading = () => {
    speechSynthesis.cancel();
    setIsReading(false);
  };

  if (!story) return null;

  return React.createElement(
    'div',
    { className: 'story-display fade-in' },
    React.createElement('h2', null, 'Your Generated Story'),
    React.createElement('p', null, story),
    React.createElement(
      'div',
      { className: 'button-container' },
      React.createElement(
        'button',
        {
          onClick: isReading ? handleStopReading : handleReadAloud,
          className: `button ${isReading ? 'button-stop' : ''}`,
        },
        isReading ? 'Stop Reading' : 'Read Aloud'
      )
    )
  );
}

export default StoryDisplay;