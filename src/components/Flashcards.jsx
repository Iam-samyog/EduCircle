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
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          perspective: '1500px',
          height: '350px',
          cursor: 'pointer'
        }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
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
              padding: '2.5rem',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--glass-border)'
            }}
          >
            {isAdmin && onDelete && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(currentIndex);
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
            <span className="badge badge-secondary" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', opacity: 0.6 }}>Question</span>
            <h3 className="text-center" style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>
              {currentCard.question || currentCard.front || currentCard}
            </h3>
            <div style={{ position: 'absolute', bottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="animate-pulse">Click to flip</span>
            </div>
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
              padding: '2.5rem',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--color-primary)'
            }}
          >
            <span className="badge badge-primary" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>Answer</span>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                {currentCard.answer || currentCard.back || 'No answer available'}
              </p>
            </div>
            <div style={{ position: 'absolute', bottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Click to flip back
            </div>
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
