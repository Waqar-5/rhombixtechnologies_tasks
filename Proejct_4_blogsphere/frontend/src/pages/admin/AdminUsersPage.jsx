import { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { adminService } from '../../services/resourceServices';
import { PageLoader } from '../../components/ui/Spinner';
import { formatDate, getErrorMessage } from '../../utils/formatters';
import { confirmToast, promiseToast } from '../../utils/toastHelpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async (searchTerm = '') => {
    setIsLoading(true);
    try {
      const { data } = await adminService.getUsers({ limit: 50, search: searchTerm });
      setUsers(data.data.users);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const handleToggleBlock = async (u) => {
    const action = u.isBlocked ? adminService.unblockUser(u._id) : adminService.blockUser(u._id);
    try {
      await promiseToast(action, {
        loading: u.isBlocked ? 'Unblocking user...' : 'Blocking user...',
        success: u.isBlocked ? 'User unblocked' : 'User blocked',
      });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isBlocked: !x.isBlocked } : x)));
    } catch {
      // error toast already shown by promiseToast
    }
  };

  const handleRoleChange = async (u, role) => {
    try {
      await promiseToast(adminService.updateUser(u._id, { role }), {
        loading: 'Updating role...',
        success: `Role updated to ${role}`,
      });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role } : x)));
    } catch {
      // error toast already shown by promiseToast
    }
  };

  const handleDelete = (u) => {
    confirmToast(`Delete ${u.name} and all their content? This can't be undone.`, async () => {
      try {
        await promiseToast(adminService.deleteUser(u._id), {
          loading: 'Deleting user...',
          success: 'User deleted',
        });
        setUsers((prev) => prev.filter((x) => x._id !== u._id));
      } catch {
        // error toast already shown by promiseToast
      }
    });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Users</h1>

      <form onSubmit={handleSearch} className="relative mb-6 max-w-sm">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-11" />
      </form>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/[0.06] text-left text-ink-400 text-xs uppercase font-mono">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-5 py-3 text-ink-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      disabled={u._id === currentUser._id}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="bg-transparent border border-ink/15 rounded-md px-2 py-1 text-xs"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-ink-400 font-mono text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${u.isBlocked ? 'bg-rose/10 text-rose' : 'bg-signal-50 text-signal'}`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                    {u._id !== currentUser._id && (
                      <>
                        <button onClick={() => handleToggleBlock(u)} className="text-xs font-medium text-signal hover:underline">
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        <button onClick={() => handleDelete(u)} className="text-xs font-medium text-rose hover:underline">
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
