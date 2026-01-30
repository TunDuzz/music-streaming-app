import { useState, useEffect } from 'react';
import { usersApi } from '../../lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Search, MoreHorizontal, Trash2, Pencil, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');


    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [confirmationText, setConfirmationText] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        displayName: '',
        role: 'User',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await usersApi.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username || '',
            email: user.email || '',
            displayName: user.displayName || '',
            role: user.role || 'User',
            password: '' // Always blank initially
        });
        setIsDialogOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        setSubmitting(true);
        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                displayName: formData.displayName,
                role: formData.role,
                avatarUrl: editingUser.avatarUrl // Preserve avatar
            };
            if (formData.password) {
                payload.password = formData.password;
            }

            const updatedUser = await usersApi.update(editingUser.id, payload);
            if (updatedUser) {
                setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
                setIsDialogOpen(false);
            }
        } catch (error) {
            alert('Failed to update user: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = (user) => {
        setDeletingUser(user);
        setConfirmationText('');
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!deletingUser) return;

        try {
            await usersApi.delete(deletingUser.id);
            setUsers(users.filter(u => u.id !== deletingUser.id));
            setIsDeleteDialogOpen(false);
            setDeletingUser(null);
        } catch (error) {
            alert('Failed to delete user: ' + (error.message || 'Unknown error'));
        }
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Users</h2>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-black/40 border-white/10 text-white"
                    />
                </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400">User</TableHead>
                            <TableHead className="text-gray-400">Email</TableHead>
                            <TableHead className="text-gray-400">Role</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-gray-400">Loading users...</TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-gray-400">No users found</TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-white/10">
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback className="text-xs bg-primary/20 text-primary">{user.displayName?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-white">{user.displayName}</p>
                                            <p className="text-xs text-gray-500">{user.username}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-300">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'} className="bg-opacity-20 text-opacity-100 hover:bg-opacity-30">
                                            {user.role || 'User'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={user.isEmailVerified ? "text-green-400 border-green-400/30" : "text-yellow-400 border-yellow-400/30"}>
                                            {user.isEmailVerified ? 'Verified' : 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                                                onClick={() => handleDeleteUser(user)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="User" className="text-black">User</option>
                                <option value="Admin" className="text-black">Admin</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>New Password <span className="text-gray-500 text-xs ml-2">(Leave blank to keep current)</span></Label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="Min 6 characters"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-[#121212] border border-white/10 text-white sm:max-w-[425px] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Delete User Account</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-gray-400 text-sm">
                            This action cannot be undone. This will permanently delete the user account
                            <span className="font-bold text-white"> {deletingUser?.username}</span> and remove all their data.
                        </p>
                        <div className="space-y-2">
                            <Label className="text-gray-400">
                                To confirm, type <span className="font-mono text-red-500 font-bold select-all">delete {deletingUser?.username}</span> below:
                            </Label>
                            <Input
                                value={confirmationText}
                                onChange={(e) => setConfirmationText(e.target.value)}
                                className="bg-white/5 border-white/10 text-white font-mono placeholder:text-gray-600"
                                placeholder={`delete ${deletingUser?.username}`}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteUser}
                            disabled={confirmationText !== `delete ${deletingUser?.username}`}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
