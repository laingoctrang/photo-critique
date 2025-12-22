import React, { useState } from 'react';
import { Database, Plus, Trash2, Download } from 'lucide-react';

export default function MongoDBERD() {
    const [collections, setCollections] = useState([
        {
            name: 'users',
            fields: [
                { name: '_id', type: 'ObjectId', required: true },
                { name: 'email', type: 'String', required: true },
                { name: 'name', type: 'String', required: true },
                { name: 'createdAt', type: 'Date', required: true }
            ]
        },
        {
            name: 'posts',
            fields: [
                { name: '_id', type: 'ObjectId', required: true },
                { name: 'userId', type: 'ObjectId', required: true, ref: 'users' },
                { name: 'title', type: 'String', required: true },
                { name: 'content', type: 'String', required: true },
                { name: 'createdAt', type: 'Date', required: true }
            ]
        }
    ]);

    const [newCollection, setNewCollection] = useState('');
    const [selectedCollection, setSelectedCollection] = useState(null);

    const addCollection = () => {
        if (newCollection.trim()) {
            setCollections([...collections, {
                name: newCollection.trim(),
                fields: [{ name: '_id', type: 'ObjectId', required: true }]
            }]);
            setNewCollection('');
        }
    };

    const removeCollection = (index) => {
        setCollections(collections.filter((_, i) => i !== index));
    };

    const addField = (collectionIndex) => {
        const updated = [...collections];
        updated[collectionIndex].fields.push({ name: '', type: 'String', required: false });
        setCollections(updated);
    };

    const updateField = (collectionIndex, fieldIndex, key, value) => {
        const updated = [...collections];
        updated[collectionIndex].fields[fieldIndex][key] = value;
        setCollections(updated);
    };

    const removeField = (collectionIndex, fieldIndex) => {
        const updated = [...collections];
        updated[collectionIndex].fields = updated[collectionIndex].fields.filter((_, i) => i !== fieldIndex);
        setCollections(updated);
    };

    const findRelationships = () => {
        const relationships = [];
        collections.forEach((collection, idx) => {
            collection.fields.forEach(field => {
                if (field.ref) {
                    const targetIdx = collections.findIndex(c => c.name === field.ref);
                    if (targetIdx !== -1) {
                        relationships.push({
                            from: idx,
                            to: targetIdx,
                            field: field.name
                        });
                    }
                }
            });
        });
        return relationships;
    };

    const downloadSVG = () => {
        const svg = document.getElementById('erd-diagram');
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mongodb-erd.svg';
        a.click();
    };

    const relationships = findRelationships();
    const cols = Math.ceil(Math.sqrt(collections.length));
    const spacing = 320;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Database className="w-8 h-8 text-emerald-400" />
                        <h1 className="text-3xl font-bold">MongoDB ERD Generator</h1>
                    </div>
                    <button
                        onClick={downloadSVG}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                    >
                        <Download className="w-4 h-4" />
                        Download SVG
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Collections */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                            <h2 className="text-xl font-semibold mb-4">Collections</h2>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newCollection}
                                    onChange={(e) => setNewCollection(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addCollection()}
                                    placeholder="Collection name"
                                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                    onClick={addCollection}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {collections.map((col, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedCollection(idx)}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                                            selectedCollection === idx
                                                ? 'bg-emerald-600/20 border border-emerald-500'
                                                : 'bg-slate-900/50 border border-slate-700 hover:bg-slate-900'
                                        }`}
                                    >
                                        <span className="font-mono">{col.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeCollection(idx);
                                            }}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Field Editor */}
                        {selectedCollection !== null && (
                            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-semibold mb-4">
                                    Edit: {collections[selectedCollection].name}
                                </h3>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {collections[selectedCollection].fields.map((field, fieldIdx) => (
                                        <div key={fieldIdx} className="bg-slate-900/50 p-3 rounded-lg space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={field.name}
                                                    onChange={(e) => updateField(selectedCollection, fieldIdx, 'name', e.target.value)}
                                                    placeholder="Field name"
                                                    className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-sm focus:outline-none focus:border-emerald-500"
                                                />
                                                <button
                                                    onClick={() => removeField(selectedCollection, fieldIdx)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateField(selectedCollection, fieldIdx, 'type', e.target.value)}
                                                    className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-sm focus:outline-none focus:border-emerald-500"
                                                >
                                                    <option>String</option>
                                                    <option>Number</option>
                                                    <option>Boolean</option>
                                                    <option>Date</option>
                                                    <option>ObjectId</option>
                                                    <option>Array</option>
                                                    <option>Object</option>
                                                </select>
                                                <label className="flex items-center gap-1 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(selectedCollection, fieldIdx, 'required', e.target.checked)}
                                                        className="rounded"
                                                    />
                                                    Required
                                                </label>
                                            </div>
                                            {field.type === 'ObjectId' && (
                                                <select
                                                    value={field.ref || ''}
                                                    onChange={(e) => updateField(selectedCollection, fieldIdx, 'ref', e.target.value)}
                                                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-sm focus:outline-none focus:border-emerald-500"
                                                >
                                                    <option value="">No reference</option>
                                                    {collections.map((c, i) => (
                                                        <option key={i} value={c.name}>ref: {c.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => addField(selectedCollection)}
                                    className="w-full mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Field
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - ERD Diagram */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                            <h2 className="text-xl font-semibold mb-4">ERD Diagram</h2>

                            <div className="bg-slate-900 rounded-lg p-4 overflow-auto" style={{ minHeight: '600px' }}>
                                <svg
                                    id="erd-diagram"
                                    width={cols * spacing}
                                    height={Math.ceil(collections.length / cols) * 280}
                                    className="mx-auto"
                                >
                                    <defs>
                                        <marker
                                            id="arrowhead"
                                            markerWidth="10"
                                            markerHeight="10"
                                            refX="9"
                                            refY="3"
                                            orient="auto"
                                        >
                                            <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
                                        </marker>
                                    </defs>

                                    {/* Draw relationships */}
                                    {relationships.map((rel, idx) => {
                                        const fromX = (rel.from % cols) * spacing + 140;
                                        const fromY = Math.floor(rel.from / cols) * 280 + 40;
                                        const toX = (rel.to % cols) * spacing + 140;
                                        const toY = Math.floor(rel.to / cols) * 280 + 40;

                                        return (
                                            <g key={idx}>
                                                <line
                                                    x1={fromX}
                                                    y1={fromY}
                                                    x2={toX}
                                                    y2={toY}
                                                    stroke="#10b981"
                                                    strokeWidth="2"
                                                    markerEnd="url(#arrowhead)"
                                                />
                                                <text
                                                    x={(fromX + toX) / 2}
                                                    y={(fromY + toY) / 2 - 5}
                                                    fill="#10b981"
                                                    fontSize="12"
                                                    textAnchor="middle"
                                                >
                                                    {rel.field}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Draw collections */}
                                    {collections.map((col, idx) => {
                                        const x = (idx % cols) * spacing + 20;
                                        const y = Math.floor(idx / cols) * 280 + 20;
                                        const height = Math.min(col.fields.length * 24 + 40, 220);

                                        return (
                                            <g key={idx}>
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width="240"
                                                    height={height}
                                                    fill="#1e293b"
                                                    stroke="#10b981"
                                                    strokeWidth="2"
                                                    rx="8"
                                                />
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width="240"
                                                    height="32"
                                                    fill="#10b981"
                                                    rx="8"
                                                />
                                                <rect
                                                    x={x}
                                                    y={y + 24}
                                                    width="240"
                                                    height="8"
                                                    fill="#10b981"
                                                />
                                                <text
                                                    x={x + 120}
                                                    y={y + 20}
                                                    fill="#0f172a"
                                                    fontSize="16"
                                                    fontWeight="bold"
                                                    textAnchor="middle"
                                                >
                                                    {col.name}
                                                </text>
                                                {col.fields.slice(0, 7).map((field, fieldIdx) => (
                                                    <text
                                                        key={fieldIdx}
                                                        x={x + 10}
                                                        y={y + 52 + fieldIdx * 24}
                                                        fill="#e2e8f0"
                                                        fontSize="13"
                                                        fontFamily="monospace"
                                                    >
                                                        {field.name}: {field.type}
                                                        {field.required && ' *'}
                                                        {field.ref && ` → ${field.ref}`}
                                                    </text>
                                                ))}
                                                {col.fields.length > 7 && (
                                                    <text
                                                        x={x + 10}
                                                        y={y + 52 + 7 * 24}
                                                        fill="#94a3b8"
                                                        fontSize="12"
                                                        fontStyle="italic"
                                                    >
                                                        ... {col.fields.length - 7} more fields
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}