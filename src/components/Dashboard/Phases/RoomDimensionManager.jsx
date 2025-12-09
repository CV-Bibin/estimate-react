import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Home, Maximize2 } from 'lucide-react';

export default function RoomDimensionManager({ floorName, roomData, updateRoomData }) {
    
    // FIX: Ensure roomData is safely handled during initial state mount
    const [rooms, setRooms] = useState((roomData && roomData[floorName]) || []);

    // Sync rooms state with global prop data
    useEffect(() => {
        // Ensure roomData is an object before accessing properties
        setRooms((roomData && roomData[floorName]) || []);
    }, [roomData, floorName]);

    // Helper to calculate area and quantity
    const calculateArea = (l, w) => {
        const length = parseFloat(l) || 0;
        const width = parseFloat(w) || 0;
        return (length * width).toFixed(2);
    };

    const addRoom = () => {
        const newRoom = { 
            id: Date.now(), 
            name: `New Room ${rooms.length + 1}`, 
            length: 0, 
            width: 0, 
            area: '0.00' 
        };
        const newRooms = [...rooms, newRoom];
        setRooms(newRooms);
        updateRoomData(floorName, newRooms);
    };

    const updateRoom = (id, field, value) => {
        const newRooms = rooms.map(room => {
            if (room.id === id) {
                const updatedRoom = { ...room, [field]: value };
                // Recalculate area if length or width changes
                if (field === 'length' || field === 'width') {
                    updatedRoom.area = calculateArea(updatedRoom.length, updatedRoom.width);
                }
                return updatedRoom;
            }
            return room;
        });
        setRooms(newRooms);
        updateRoomData(floorName, newRooms);
    };

    const removeRoom = (id) => {
        const newRooms = rooms.filter(room => room.id !== id);
        setRooms(newRooms);
        updateRoomData(floorName, newRooms);
    };

    const totalFloorArea = rooms.reduce((sum, room) => sum + parseFloat(room.area || 0), 0).toFixed(2);

    return (
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-lg">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-blue-100">
                <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                    <Maximize2 size={20} /> {floorName} Dimensions
                </h4>
                <span className="text-sm font-medium text-gray-600">Total Area: <span className="text-green-600 font-bold">{totalFloorArea} m²</span></span>
            </div>

            <div className="space-y-3">
                {rooms.map((room) => (
                    <div key={room.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <Home size={18} className="text-blue-500" />
                        
                        {/* Room Name */}
                        <input 
                            type="text"
                            placeholder="Room Name"
                            value={room.name}
                            onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                            className="w-40 p-1 text-sm font-medium border rounded outline-none"
                        />

                        {/* Length (L) */}
                        <div className="flex-1 flex items-center">
                            <label className="text-xs text-gray-500 mr-1">L:</label>
                            <input 
                                type="number"
                                value={room.length}
                                onChange={(e) => updateRoom(room.id, 'length', e.target.value)}
                                className="w-16 p-1 text-sm border rounded text-center"
                            />
                        </div>

                        {/* Width (W) */}
                        <div className="flex-1 flex items-center">
                            <label className="text-xs text-gray-500 mr-1">W:</label>
                            <input 
                                type="number"
                                value={room.width}
                                onChange={(e) => updateRoom(room.id, 'width', e.target.value)}
                                className="w-16 p-1 text-sm border rounded text-center"
                            />
                        </div>

                        {/* Area (Read-Only) */}
                        <div className="text-sm font-bold text-green-700 w-20 text-right">
                            {room.area} m²
                        </div>

                        <button onClick={() => removeRoom(room.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button 
                onClick={addRoom} 
                className="mt-4 text-xs text-blue-600 font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded transition-colors border border-dashed border-blue-200"
            >
                <Plus size={14} /> Add Room
            </button>
        </div>
    );
}