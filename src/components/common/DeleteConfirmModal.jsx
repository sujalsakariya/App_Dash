import React from 'react';

const DeleteConfirmModal = ({
  open,
  item,
  onCancel,
  onConfirm,
  loading = false,
  fields = [
    { label: 'ID', key: 'id' },
    { label: 'Name', key: 'name' },
    { label: 'Company', key: 'customer' },
    { label: 'Email', key: 'email' },
  ],
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[95vw] relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onCancel}
          aria-label="Cancel"
        >
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>×</span>
        </button>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="mb-4 p-4 rounded bg-gray-200 text-gray-800 dark:bg-gray-900 dark:text-black" style={{ minWidth: '300px' }}>
          {fields.map(({ label, key }) => (
            <div className="mb-1" key={key}>
              <span className="font-bold">{label}:</span> {item[key] || 'N/A'}
            </div>
          ))}
        </div>
        <div className="text-gray-700 mb-6 dark:text-black">{description}</div>
        <div className="flex gap-3 justify-between">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-medium"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
