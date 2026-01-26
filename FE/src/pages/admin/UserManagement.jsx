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
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Search, MoreHorizontal, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"; // We need to install dropdown-menu, I'll assume we have it or use simple delete button

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

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

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersApi.delete(id);
                setUsers(users.filter(u => u.id !== id));
            } catch (error) {
                alert('Failed to delete user');
            }
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
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default UserManagement;
