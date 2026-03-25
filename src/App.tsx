import { useState, useEffect } from 'react'
import './index.css'

// 할 일 데이터 구조 정의
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// 필터 타입 정의
type Filter = 'all' | 'active' | 'completed';

function App() {
  // 할 일 목록 상태 관리 (초기값은 localStorage에서 불러옴)
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const savedTodos = localStorage.getItem('todos');
      // 데이터가 있으면 파싱하고, 없으면 빈 배열 반환
      return savedTodos ? JSON.parse(savedTodos) : [];
    } catch (error) {
      // JSON 파싱 에러 발생 시 콘솔에 기록하고 빈 배열 반환 (보안 및 안정성 개선)
      console.error('localStorage에서 할 일을 불러오는 중 오류 발생:', error);
      return [];
    }
  });

  // 입력값 및 현재 필터 상태 관리
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // 할 일 목록이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 새로운 할 일 추가 함수
  const addTodo = () => {
    if (inputValue.trim() === '') return;
    const newTodo: Todo = {
      id: Date.now(), // 고유 ID 생성
      text: inputValue,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setInputValue(''); // 입력창 초기화
  };

  // 할 일 완료 상태 토글 함수
  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 할 일 삭제 함수
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 현재 필터 조건에 따라 보여줄 할 일 목록 계산
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="App">
      <h1>Todo App</h1>
      
      {/* 입력 섹션 */}
      <div className="input-group">
        <input
          type="text"
          placeholder="새로운 할 일을 입력하세요"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo} style={{ backgroundColor: '#646cff' }}>추가</button>
      </div>
      
      {/* 필터 버튼 섹션 */}
      <div className="filters">
        <button 
          onClick={() => setFilter('all')}
          style={{ borderColor: filter === 'all' ? '#646cff' : 'transparent' }}
        >전체</button>
        <button 
          onClick={() => setFilter('active')}
          style={{ borderColor: filter === 'active' ? '#646cff' : 'transparent' }}
        >진행 중</button>
        <button 
          onClick={() => setFilter('completed')}
          style={{ borderColor: filter === 'completed' ? '#646cff' : 'transparent' }}
        >완료됨</button>
      </div>

      {/* 할 일 목록 렌더링 */}
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input 
              type="checkbox" 
              checked={todo.completed} 
              onChange={() => toggleTodo(todo.id)} 
            />
            <span style={{ 
              textDecoration: todo.completed ? 'line-through' : 'none',
              opacity: todo.completed ? 0.6 : 1
            }}>
              {todo.text}
            </span>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
