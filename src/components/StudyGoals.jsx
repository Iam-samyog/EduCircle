import { useState, useEffect } from 'react';
import { subscribeToGoals, createGoal, updateGoalProgress, deleteGoal } from '../services/goalsService';
import { FaPlus, FaTrash, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const StudyGoals = ({ roomId, participants }) => {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToGoals(roomId, (updatedGoals) => {
      setGoals(updatedGoals);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    if (!goalName.trim() || !assignedTo || !deadline) {
      toast.error('Please fill in all fields');
      return;
    }

    setCreating(true);
    try {
      const participant = participants.find(p => p.userId === assignedTo);
      await createGoal(roomId, {
        goalName: goalName.trim(),
        assignedTo,
        assignedToName: participant?.name || 'Unknown',
        deadline: new Date(deadline)
      });

      toast.success('Goal created!');
      setShowModal(false);
      setGoalName('');
      setAssignedTo('');
      setDeadline('');
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const handleProgressChange = async (goalId, newProgress) => {
    try {
      await updateGoalProgress(goalId, newProgress);
      if (newProgress === 100) {
        toast.success('Goal completed! 🎉');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteGoal(goalId);
      toast.success('Goal deleted');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const getDeadlineColor = (deadline) => {
    if (!deadline) return 'var(--color-text-secondary)';
    const date = deadline.toDate ? deadline.toDate() : new Date(deadline);
    const daysUntil = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'var(--color-error)';
    if (daysUntil <= 2) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <h3>Study Goals</h3>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <FaPlus />
          Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <p className="text-muted">No goals yet. Create one to track your progress!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {goals.map((goal) => (
            <div key={goal.id} className="glass" style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={goal.progress === 100}
                  onChange={(e) => handleProgressChange(goal.id, e.target.checked ? 100 : 0)}
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    cursor: 'pointer',
                    accentColor: 'var(--color-primary)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    marginBottom: '0.25rem',
                    textDecoration: goal.progress === 100 ? 'line-through' : 'none',
                    color: goal.progress === 100 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'
                  }}>
                    {goal.goalName}
                  </h4>
                  <p className="text-sm text-secondary">
                    Assigned to: {goal.assignedToName}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-error)' }}
                >
                  <FaTrash />
                </button>
              </div>

              <div className="flex items-center justify-between" style={{ paddingLeft: '2.5rem' }}>
                <p className="text-sm" style={{ color: getDeadlineColor(goal.deadline) }}>
                  Due: {goal.deadline ? format(goal.deadline.toDate ? goal.deadline.toDate() : new Date(goal.deadline), 'MMM d, yyyy') : 'No deadline'}
                </p>
                {goal.progress === 100 && (
                  <span className="badge badge-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    <FaCheck style={{ marginRight: '0.25rem' }} />
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {showModal && (
        <div className="modal-overlay animate-fadeIn" onClick={() => setShowModal(false)}>
          <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Study Goal</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateGoal}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Goal Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Read Chapter 5"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    disabled={creating}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Assign To</label>
                  <select
                    className="input"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    disabled={creating}
                  >
                    <option value="">Select participant</option>
                    {participants?.map((participant) => (
                      <option key={participant.userId} value={participant.userId}>
                        {participant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Deadline</label>
                  <input
                    type="date"
                    className="input"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={creating}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? <div className="spinner spinner-sm"></div> : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGoals;
