import React, { useState, useEffect } from 'react';
import {
  Button,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Checkbox,
  TextareaAutosize,
  Paper,
  Grid,
  Typography,
  IconButton,
  Menu,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';

const ExerciseAssignment = () => {
  const [categories, setCategories] = useState({});
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [exercises, setExercises] = useState([]);
  const [days, setDays] = useState({ M: false, T: false, W: false, F: false, S: false });
  const [sessionsPerDay, setSessionsPerDay] = useState(1);
  const [therapistNotes, setTherapistNotes] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(null);
  const [savedCombos, setSavedCombos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/exercises')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching data:', error));
    
    axios.get('http://localhost:3000/api/programs')
      .then(response => setSavedCombos(response.data))
      .catch(error => console.error('Error fetching programs:', error));
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setExercises(items);
  };

  const toggleDay = (day) => {
    setDays({ ...days, [day]: !days[day] });
  };

  const handleAddExercise = (exercise) => {
    setExercises([...exercises, { name: exercise, sets: 0, reps: 0, holdTime: 0, side: 'Left' }]);
  };

  const handleSaveCombo = () => {
    const newProgram = { exercises, sessionsPerDay, days, therapistNotes };
    axios.post('http://localhost:3000/api/programs', newProgram)
      .then(() => {
        alert('Program saved successfully');
        setSavedCombos([...savedCombos, newProgram]);
      })
      .catch(error => console.error('Error saving program:', error));
  };

  const handleClearAll = () => {
    setExercises([]);
  };

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setCurrentExerciseIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentExerciseIndex(null);
  };

  const handleDuplicate = () => {
    if (currentExerciseIndex !== null) {
      const exercise = exercises[currentExerciseIndex];
      if (exercise.side !== 'Both') {
        setExercises([...exercises, { ...exercise, side: exercise.side === 'Left' ? 'Right' : 'Left' }]);
      }
      handleMenuClose();
    }
  };

  const handleSideChange = (index, side) => {
    const updatedExercises = [...exercises];
    updatedExercises[index].side = side;
    setExercises(updatedExercises);
  };

  return (
    <Paper style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom>Exercise Assignment</Typography>
      
      <Select value={selectedBodyPart} onChange={(e) => setSelectedBodyPart(e.target.value)} fullWidth>
        {Object.keys(categories).map((part) => (
          <MenuItem key={part} value={part}>
            {part}
          </MenuItem>
        ))}
      </Select>

      {selectedBodyPart && (
        <div style={{ margin: '10px 0' }}>
          {categories[selectedBodyPart].map((exercise) => (
            <Button key={exercise} variant="outlined" onClick={() => handleAddExercise(exercise)} style={{ margin: '5px' }}>
              {exercise}
            </Button>
          ))}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="exercises">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {exercises.map((exercise, index) => (
                <Draggable key={index} draggableId={`exercise-${index}`} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                      <Typography variant="h6">{exercise.name}</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <TextField label="Sets" type="number" value={exercise.sets} onChange={(e) => {
                            const updatedExercises = [...exercises];
                            updatedExercises[index].sets = e.target.value;
                            setExercises(updatedExercises);
                          }} fullWidth />
                        </Grid>
                        <Grid item xs={3}>
                          <TextField label="Reps" type="number" value={exercise.reps} onChange={(e) => {
                            const updatedExercises = [...exercises];
                            updatedExercises[index].reps = e.target.value;
                            setExercises(updatedExercises);
                          }} fullWidth />
                        </Grid>
                        <Grid item xs={3}>
                          <TextField label="Hold Time" type="number" value={exercise.holdTime} onChange={(e) => {
                            const updatedExercises = [...exercises];
                            updatedExercises[index].holdTime = e.target.value;
                            setExercises(updatedExercises);
                          }} fullWidth />
                        </Grid>
                        <Grid item xs={3}>
                          <Select
                            value={exercise.side}
                            onChange={(e) => handleSideChange(index, e.target.value)}
                            fullWidth
                          >
                            <MenuItem value="Left">Left</MenuItem>
                            <MenuItem value="Right">Right</MenuItem>
                            <MenuItem value="Both">Both</MenuItem>
                          </Select>
                        </Grid>
                      </Grid>
                      <IconButton onClick={(event) => handleMenuOpen(event, index)}>
                        <MoreVertIcon />
                      </IconButton>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button variant="contained" color="primary" onClick={handleSaveCombo} style={{ margin: '10px 5px' }}>Save as Combo</Button>
      <Button variant="contained" color="secondary" onClick={handleClearAll} style={{ margin: '10px 5px' }}>Clear All</Button>

      <div>
        <Typography variant="h6">Days of the Week</Typography>
        {Object.keys(days).map((day) => (
          <FormControlLabel
            key={day}
            control={<Checkbox checked={days[day]} onChange={() => toggleDay(day)} />}
            label={day}
          />
        ))}
      </div>

      <TextField
        label="Sessions Per Day"
        type="number"
        value={sessionsPerDay}
        onChange={(e) => setSessionsPerDay(e.target.value)}
        fullWidth
      />

      <TextareaAutosize
        minRows={3}
        placeholder="Therapist Notes"
        value={therapistNotes}
        onChange={(e) => setTherapistNotes(e.target.value)}
        style={{ width: '100%', marginTop: '10px' }}
      />

      <div>
        <Typography variant="h5">Saved Programs</Typography>
        {savedCombos.map((program, index) => (
          <div key={index}>
            <Typography variant="h6">Program {index + 1}</Typography>
            {/* Render program details */}
          </div>
        ))}
      </div>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <ListItem button onClick={handleDuplicate} disabled={exercises[currentExerciseIndex]?.side === 'Both'}>
          <ListItemIcon>
            <MoreVertIcon />
          </ListItemIcon>
          <ListItemText primary="Duplicate for Right Side" />
        </ListItem>
      </Menu>
    </Paper>
  );
};

export default ExerciseAssignment;
