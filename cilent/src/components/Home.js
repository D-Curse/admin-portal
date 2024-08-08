import { useState, useContext } from 'react'
import { AuthContext } from './AuthProvider'
import './css/global.css'
import './css/home.css'
import axios from 'axios'

const Home = () => {
    const [responseData, setResponseData] = useState(null)
    const [sqlQuery, setSqlQuery] = useState('')
    const [errors, setErrors] = useState(null)
    const [details, setDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const { auth } = useContext(AuthContext)
    

    const handleSqlQueryChange = (event) => {
        setSqlQuery(event.target.value)
    };

    const executeQuery = async () => {
        setLoading(true)
        const query = sqlQuery.trim()

        if(query.trim().toLowerCase().startsWith('update')){
            if(auth.role === 'admin'){
                try {
                    const response = await axios.post('http://localhost:3000/api/query/update', { query })
                    setResponseData(response.data)
                    setErrors(null)
                    setDetails(null)
                } catch (error) {
                    setErrors(error.response?.data?.error || 'An unknown error occurred')
                    setDetails(error.response?.data?.details || null)
                    setResponseData(null)
                } finally {
                    setLoading(false)
                }
            } else {
                setErrors('Error 404!!!')
                setDetails('Developer cant use update query')
                setLoading(false)
            }
            return
        }

        try {
            const response = await axios.post('http://localhost:3000/api/query', { query })
            setResponseData(response.data)
            setErrors(null)
            setDetails(null)
        } catch (error) {
            setErrors(error.response?.data?.error || 'An unknown error occurred')
            setDetails(error.response?.data?.details || null)
            setResponseData(null)
        } finally {
            setLoading(false)
        }
    };

    const renderTable = (data) => {
        if (Array.isArray(data.databases)) {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>Database Name</th>
                            <th>Size on Disk (bytes)</th>
                            <th>Empty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.databases.map((db, index) => (
                            <tr key={index}>
                                <td>{db.name}</td>
                                <td>{db.sizeOnDisk}</td>
                                <td>{db.empty ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else if (Array.isArray(data)) {
            return (
                <table>
                    <thead>
                        <tr>
                            {Object.keys(data[0]).filter(key => key !== '_id' && key !== '__v').map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((form, formIndex) => (
                            <tr key={formIndex}>
                                {Object.keys(form).filter(key =>  key !== '_id' && key !== '__v').map((key, index) => (
                                    <td key={index}>{form[key]}</td>
                                ))}  
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else if (data.database) {
            return (
                <div>
                    <h4>Database: {data.database}</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>COLLECTION</th>
                                <th>DOCUMENT COUNT</th>
                                <th>COLUMN COUNT</th>
                                <th>ROW COUNT</th>
                                <th>FIELDS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.collections.map((collection, index) => (
                                <tr key={index}>
                                    <td>{collection.collectionName}</td>
                                    <td>{collection.documentCount}</td>
                                    <td>{collection.columnCount}</td>
                                    <td>{collection.rowCount}</td>
                                    <td>{collection.fields.join(', ')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else if (data.error) {
            return (
                <div>
                    <p>{data.error}</p>
                </div>
            );
        } else {
            return <p>Invalid response format</p>;
        }
    };

    return (
        <div className="Home">
            <div className="home_content">
                <h2>DASHBOARD</h2>
                <h3 className='role'>ROLE: {auth.role.toUpperCase()}</h3>
                <input 
                    className='sql-query-input'
                    type="text" 
                    placeholder="Enter SQL query..."
                    value={sqlQuery}
                    onChange={handleSqlQueryChange}
                    />
                <button className='query-btn' onClick={executeQuery}>Execute Query</button>

                {loading && <div className="loader"></div>}
                {!loading && !errors && !responseData && !sqlQuery && (
                    <p className='first-render-text'>Get started by entering your query.</p>
                )}
                {!loading && errors && (
                    <div className='error-box'>
                        <p className="error-message">{errors}</p>
                        {details && <p className="error-details">{details}</p>}
                    </div>
                )}
                {!loading && responseData && renderTable(responseData)}
            </div>
        </div>
    );
};

export default Home;
