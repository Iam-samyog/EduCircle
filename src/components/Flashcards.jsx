import { useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaRandom, FaRedo, FaTrash } from 'react-icons/fa';

const Flashcards = ({ flashcards, onDelete, isAdmin }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="empty-state">
        <p className="text-muted">No flashcards available. Upload notes to generate flashcards!</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    setFlipped(false);
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    setCurrentIndex(randomIndex);
  };

  const handleRestart = () => {
    setFlipped(false);
    setCurrentIndex(0);
  };

  return (
    <div>
      {/* Flashcard */}
      <div
        className="glass"
        style={{
          minHeight: '300px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          perspective: '1000px',
          marginBottom: '1.5rem'
        }}
        onClick={() => setFlipped(!flipped)}
      >
        {isAdmin && onDelete && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this flashcard?')) {
                        onDelete(currentIndex);
                    }
                }}
                className="btn-ghost"
                style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem', 
                    zIndex: 20, 
                    color: 'var(--color-error)',
                    padding: '0.5rem'
                }}
                title="Delete card"
            >
                <FaTrash />
            </button>
        )}
        <div
          style={{
            width: '100%',
            height: '100%',
            transition: 'transform 0.6s',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
              Question
            </p>
            <p className="text-xl text-center" style={{ fontWeight: 600 }}>
              {currentCard.question || currentCard.front || currentCard}
            </p>
            <p className="text-sm text-muted" style={{ marginTop: '2rem' }}>
              Click to flip
            </p>
          </div>

          {/* Back */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
              Answer
            </p>
            <p className="text-xl text-center" style={{ fontWeight: 600 }}>
              {currentCard.answer || currentCard.back || 'No answer available'}
            </p>
            <p className="text-sm text-muted" style={{ marginTop: '2rem' }}>
              Click to flip back
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="text-center" style={{ marginBottom: '1rem' }}>
        <p className="text-secondary">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
        <div className="progress" style={{ marginTop: '0.5rem' }}>
          <div
            className="progress-bar"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-md">
        <button
          onClick={handleRestart}
          className="btn btn-ghost btn-sm"
          title="Restart"
        >
          <FaRedo />
        </button>

        <button
          onClick={handlePrevious}
          className="btn btn-secondary"
          disabled={flashcards.length === 1}
        >
          <FaArrowLeft />
          Previous
        </button>

        <button
          onClick={handleShuffle}
          className="btn btn-ghost"
          title="Shuffle"
        >
          <FaRandom />
        </button>

        <button
          onClick={handleNext}
          className="btn btn-secondary"
          disabled={flashcards.length === 1}
        >
          Next
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Flashcards;
