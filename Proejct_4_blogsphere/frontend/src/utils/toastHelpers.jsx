import toast from 'react-hot-toast';
import { getErrorMessage } from './formatters';

/**
 * Replaces the native window.confirm() with an in-brand toast that has
 * real Confirm/Cancel buttons — matches the site's design instead of an
 * unstyled browser dialog, and doesn't block the JS thread.
 *
 * Usage:
 *   confirmToast('Delete this post permanently?', async () => {
 *     await promiseToast(blogService.deleteBlog(id), { ... });
 *   });
 */
export const confirmToast = (message, onConfirm, { danger = true } = {}) => {
  toast(
    (t) => (
      <div className="flex flex-col gap-3 min-w-[240px]">
        <p className="text-sm text-paper-light leading-snug">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="btn-ghost !text-ink-300 hover:!text-paper-light hover:!bg-white/10 py-1.5 px-3.5 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className={danger ? 'btn-danger py-1.5 px-3.5 text-xs' : 'btn-stamp py-1.5 px-3.5 text-xs'}
          >
            {danger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity, // stays open until the person chooses — no accidental auto-dismiss on a destructive action
      style: { background: '#14171F', maxWidth: '360px' },
    }
  );
};

/**
 * Wraps an async action (typically an API call) in a consistent
 * loading → success/error toast lifecycle, so every delete/update across
 * the app feels the same rather than each page hand-rolling its own
 * try/catch + toast.success/toast.error boilerplate.
 *
 * Usage:
 *   await promiseToast(blogService.deleteBlog(id), {
 *     loading: 'Deleting post...',
 *     success: 'Post deleted',
 *   });
 */
export const promiseToast = (promise, { loading, success }) =>
  toast.promise(
    promise,
    {
      loading,
      success,
      error: (err) => getErrorMessage(err),
    },
    {
      style: { minWidth: '200px' },
      success: { duration: 2200, className: 'toast-progress toast-progress-success' },
      error: { duration: 3200, className: 'toast-progress toast-progress-error' },
    }
  );
