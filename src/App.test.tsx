import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { expect, test, beforeEach, vi } from 'vitest';

// 각 테스트 시작 전 localStorage 초기화
beforeEach(() => {
  localStorage.clear();
});

test('Todo App 제목이 렌더링되는지 확인', () => {
  render(<App />);
  const linkElement = screen.getByText(/Todo App/i);
  expect(linkElement).toBeInTheDocument();
});

test('새로운 할 일을 추가할 수 있는지 확인', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/새로운 할 일을 입력하세요/i);
  const button = screen.getByText(/추가/i);

  fireEvent.change(input, { target: { value: 'TDD 공부하기' } });
  fireEvent.click(button);

  const todoItem = screen.getByText(/TDD 공부하기/i);
  expect(todoItem).toBeInTheDocument();
});

test('할 일의 완료 상태를 변경할 수 있는지 확인', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/새로운 할 일을 입력하세요/i);
  const button = screen.getByText(/추가/i);

  fireEvent.change(input, { target: { value: 'TDD 공부하기' } });
  fireEvent.click(button);

  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).not.toBeChecked();

  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();
});

test('할 일을 삭제할 수 있는지 확인', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/새로운 할 일을 입력하세요/i);
  const button = screen.getByText(/추가/i);

  fireEvent.change(input, { target: { value: 'TDD 공부하기' } });
  fireEvent.click(button);

  const deleteButton = screen.getByText(/삭제/i);
  fireEvent.click(deleteButton);

  const todoItem = screen.queryByText(/TDD 공부하기/i);
  expect(todoItem).not.toBeInTheDocument();
});

test('필터링 기능이 정상 작동하는지 확인', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/새로운 할 일을 입력하세요/i);
  const button = screen.getByText(/추가/i);

  // 두 개의 할 일 추가
  fireEvent.change(input, { target: { value: '진행 중인 할 일' } });
  fireEvent.click(button);
  fireEvent.change(input, { target: { value: '완료된 할 일' } });
  fireEvent.click(button);

  // 두 번째 할 일을 완료 처리
  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[1]);

  // '완료됨' 필터 확인
  const completedFilter = screen.getByText(/완료됨/i);
  fireEvent.click(completedFilter);
  expect(screen.queryByText('진행 중인 할 일')).not.toBeInTheDocument();
  expect(screen.getByText('완료된 할 일')).toBeInTheDocument();

  // '진행 중' 필터 확인
  const activeFilter = screen.getByText(/진행 중/i);
  fireEvent.click(activeFilter);
  expect(screen.getByText('진행 중인 할 일')).toBeInTheDocument();
  expect(screen.queryByText('완료된 할 일')).not.toBeInTheDocument();

  // '전체' 필터 확인
  const allFilter = screen.getByText(/전체/i);
  fireEvent.click(allFilter);
  expect(screen.getByText('진행 중인 할 일')).toBeInTheDocument();
  expect(screen.getByText('완료된 할 일')).toBeInTheDocument();
});

test('할 일이 localStorage에 유지되는지 확인', () => {
  const { unmount } = render(<App />);
  const input = screen.getByPlaceholderText(/새로운 할 일을 입력하세요/i);
  const button = screen.getByText(/추가/i);

  fireEvent.change(input, { target: { value: '유지될 할 일' } });
  fireEvent.click(button);
  expect(screen.getByText('유지될 할 일')).toBeInTheDocument();

  unmount();

  render(<App />);
  expect(screen.getByText('유지될 할 일')).toBeInTheDocument();
});

test('localStorage 파싱 에러를 안전하게 처리하는지 확인', () => {
  // 유효하지 않은 JSON 데이터를 localStorage에 설정
  localStorage.setItem('todos', 'invalid-json');

  // 테스트 출력에서 console.error 로그를 숨기기 위해 스파이 생성
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(<App />);

  // 앱이 죽지 않고 제목이 정상적으로 렌더링되는지 확인
  expect(screen.getByText(/Todo App/i)).toBeInTheDocument();
  const todoItems = screen.queryAllByRole('listitem');
  expect(todoItems.length).toBe(0);

  // console.error가 호출되었는지 확인
  expect(consoleErrorSpy).toHaveBeenCalled();

  consoleErrorSpy.mockRestore();
});