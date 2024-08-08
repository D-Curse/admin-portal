import './css/Forms.css';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function Forms() {
    const [isPending, setIsPending] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsPending(true);

        try {
            console.log("Sending data:", formData);

            const res = await axios.post('http://localhost:3000/api/form', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(res.data);
            console.log("Data Added");
            setIsPending(false);
            navigate('/form');
        } catch (err) {
            console.error("Error:", err.response ? err.response.data : err.message);
            setIsPending(false);
        }
    };

    return (
        <div className="Form">
            <form onSubmit={handleSubmit}>
                <p className="form-head">ADD DATA</p>
                <div className="input-container">
                    <label>
                        Name
                    </label>
                    <input 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <label>
                        Age
                    </label>
                    <input 
                        type="number" 
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="0"
                        max="120"
                        required
                    />
                </div>
                <label>
                    Gender
                </label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                >
                    <option value="Male">MALE</option>
                    <option value="Female">FEMALE</option>
                </select>
                {!isPending && <button>ADD DATA</button>}
                {isPending && <button disabled>ADDING DATA...</button>}
            </form>
        </div>
    );
}
