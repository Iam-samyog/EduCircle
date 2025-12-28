import { useState } from 'react';
import { FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FlashcardCreator = ({ onAddFlashcard, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error('Both question and answer are required');
      return;
    }

    setLoading(true);
    try {
      await onAddFlashcard({
        question: question.trim(),
        answer: answer.trim(),
        createdAt: new Date().toISOString()
      });
      setQuestion('');
      setAnswer('');
      toast.success('Flashcard added!');
    } catch (error) {
      console.error('Error adding flashcard:', error);
      toast.error('Failed to add flashcard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: '#0369A1' }}>Add New Flashcard</h4>
        <button onClick={onCancel} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem' }}>Question</label>
          <textarea
            className="input"
            placeholder="Enter the question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ minHeight: '80px', fontSize: '0.9rem' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem' }}>Answer</label>
          <textarea
            className="input"
            placeholder="Enter the answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ minHeight: '80px', fontSize: '0.9rem' }}
            required
          />
        </div>
        
        <div className="flex justify-end gap-sm">
          <button type="button" onClick={onCancel} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="spinner spinner-sm"></div> : <><FaPlus /> Add Card</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlashcardCreator;
