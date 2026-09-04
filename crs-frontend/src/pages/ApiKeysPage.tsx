// path: crs-frontend/src/pages/ApiKeysPage.tsx
// purpose: trang quan tri API Key (chi ADMIN) - cap moi, thu hoi, xem danh sach
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getApiKeys, createApiKey, revokeApiKey } from '../api/apiKeyApi';
import type { ApiKey } from '../types/apiKey';

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [ownerName, setOwnerName] = useState<string>('');
    const [scopes, setScopes] = useState<string>('courses:read');
    const [validDays, setValidDays] = useState<string>('30');
    const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadKeys = useCallback(() => {
        setLoading(true);
        getApiKeys()
            .then((res) => setKeys(res.data))
            .catch(() => setError('Khong tai duoc danh sach API Key.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadKeys();
    }, [loadKeys]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setNewKeyValue(null);
        try {
            const res = await createApiKey({
                ownerName,
                scopes,
                validDays: validDays ? Number(validDays) : undefined,
            });
            setNewKeyValue(res.data.keyValue); // Hien thi 1 lan duy nhat de Admin copy
            setOwnerName('');
            loadKeys();
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Cap API Key khong thanh cong.');
            }
        }
    };

    const handleRevoke = async (key: ApiKey) => {
        if (!window.confirm(`Thu hoi API Key cua "${key.ownerName}"?`)) return;
        try {
            await revokeApiKey(key.id);
            loadKeys();
        } catch {
            alert('Thu hoi khong thanh cong.');
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Quản lý API Key đối tác</h2>

            {/* Form cấp mới API Key */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e9ecef' }}>
                <h3>Cấp API Key mới</h3>
                <form onSubmit={handleCreate}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Tên đối tác:</label>
                        <input
                            type="text"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            required
                            placeholder="Ví dụ: Ứng dụng Đối tác B"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Scopes (cách nhau bởi dấu phẩy):</label>
                        <input
                            type="text"
                            value={scopes}
                            onChange={(e) => setScopes(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Hiệu lực (số ngày, để trống = vĩnh viễn):</label>
                        <input
                            type="number"
                            value={validDays}
                            onChange={(e) => setValidDays(e.target.value)}
                            placeholder="30"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#dc3545', marginBottom: '12px', fontWeight: 'bold' }}>{error}</div>
                    )}

                    <button
                        type="submit"
                        style={{ padding: '10px 20px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Cấp API Key
                    </button>
                </form>
            </div>

            {/* Thông báo hiển thị Key duy nhất 1 lần */}
            {newKeyValue && (
                <div style={{ background: '#d1e7dd', color: '#0f5132', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #badbcc' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                        Key vừa tạo (chỉ hiển thị 1 lần, hãy lưu lại ngay):
                    </p>
                    <code style={{ background: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '15px', color: '#d63384', display: 'inline-block', border: '1px solid #ced4da' }}>
                        {newKeyValue}
                    </code>
                </div>
            )}

            {/* Danh sách các API Key */}
            <h3>Danh sách API Key</h3>
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', background: '#fff' }}>
                    <thead>
                        <tr style={{ background: '#f1f3f5', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Đối tác</th>
                            <th style={{ padding: '12px' }}>Scopes</th>
                            <th style={{ padding: '12px' }}>Trạng thái</th>
                            <th style={{ padding: '12px' }}>Hết hạn</th>
                            <th style={{ padding: '12px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((k) => (
                            <tr key={k.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '12px' }}>{k.ownerName}</td>
                                <td style={{ padding: '12px' }}><code>{Array.isArray(k.scopes) ? k.scopes.join(', ') : k.scopes}</code></td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: k.status === 'ACTIVE' ? '#d1e7dd' : '#f8d7da',
                                        color: k.status === 'ACTIVE' ? '#0f5132' : '#842029'
                                    }}>
                                        {k.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {k.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => handleRevoke(k)}
                                            style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Thu hồi
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {keys.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#6c757d' }}>
                                    Chưa có API Key nào được cấp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}