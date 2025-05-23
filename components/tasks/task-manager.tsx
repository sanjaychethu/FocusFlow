"use client"

import { useState } from 'react'
import { useAppData } from '@/providers/app-data-provider'
import { Button } from '@/components/ui/button'
import {
  PlusCircle,
  Calendar,
  ListFilter,
  Inbox,
  CheckCircle2,
  CircleEllipsis,
  Tag,
  CalendarDays,
  Layers,
  Search
} from 'lucide-react'
import { format } from 'date-fns'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { TaskFormDialog } from './task-form-dialog'
import { Task, TaskStatus } from '@/lib/types'
import TaskItem from './task-item'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function TaskManager() {
  const { tasks, loadingTasks, updateTask } = useAppData()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['low', 'medium', 'high'])
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined)
  
  const today = format(new Date(), 'yyyy-MM-dd')
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Priority filter
    if (!selectedPriorities.includes(task.priority)) {
      return false
    }
    
    return true
  })
  
  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'todo')
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress')
  const completedTasks = filteredTasks.filter(task => task.status === 'completed')
  
  // Tasks due today
  const tasksForToday = filteredTasks.filter(task => task.dueDate === today && task.status !== 'completed')
  
  // Handle task status update
  const handleTaskStatusChange = async (task: Task, newStatus: TaskStatus) => {
    await updateTask({
      ...task,
      status: newStatus,
    })
  }
  
  // Handle edit task
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task)
    setShowTaskForm(true)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {todoTasks.length} tasks to do, {completedTasks.length} completed
          </p>
        </div>
        <Button onClick={() => {
          setTaskToEdit(undefined)
          setShowTaskForm(true)
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <ListFilter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedPriorities.includes('high')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedPriorities([...selectedPriorities, 'high'])
                } else {
                  setSelectedPriorities(selectedPriorities.filter(p => p !== 'high'))
                }
              }}
            >
              High Priority
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedPriorities.includes('medium')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedPriorities([...selectedPriorities, 'medium'])
                } else {
                  setSelectedPriorities(selectedPriorities.filter(p => p !== 'medium'))
                }
              }}
            >
              Medium Priority
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedPriorities.includes('low')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedPriorities([...selectedPriorities, 'low'])
                } else {
                  setSelectedPriorities(selectedPriorities.filter(p => p !== 'low'))
                }
              }}
            >
              Low Priority
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">All Tasks</span>
            <span className="inline sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="today" className="flex gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Today</span>
            <span className="inline sm:hidden">Today</span>
          </TabsTrigger>
          <TabsTrigger value="todo" className="flex gap-2">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">To Do</span>
            <span className="inline sm:hidden">Todo</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Completed</span>
            <span className="inline sm:hidden">Done</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="space-y-6">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full border-4 border-muted p-4 mb-4">
                  <Inbox className="h-12 w-12 text-muted-foreground" />
                </div>
                {searchQuery ? (
                  <>
                    <h2 className="text-xl font-semibold tracking-tight mb-2">No matching tasks</h2>
                    <p className="text-muted-foreground max-w-sm mb-4">
                      Try adjusting your search or filters to find what you're looking for
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold tracking-tight mb-2">No tasks yet</h2>
                    <p className="text-muted-foreground max-w-sm mb-4">
                      Create your first task to get started
                    </p>
                    <Button onClick={() => setShowTaskForm(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Task
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <>
                {todoTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Inbox className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-lg font-medium">To Do</h2>
                      <div className="ml-2 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                        {todoTasks.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {todoTasks.map(task => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          onStatusChange={handleTaskStatusChange} 
                          onEdit={() => handleEditTask(task)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {inProgressTasks.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CircleEllipsis className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-lg font-medium">In Progress</h2>
                      <div className="ml-2 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                        {inProgressTasks.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {inProgressTasks.map(task => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          onStatusChange={handleTaskStatusChange} 
                          onEdit={() => handleEditTask(task)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {completedTasks.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-lg font-medium">Completed</h2>
                      <div className="ml-2 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                        {completedTasks.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {completedTasks.slice(0, 5).map(task => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          onStatusChange={handleTaskStatusChange} 
                          onEdit={() => handleEditTask(task)}
                        />
                      ))}
                    </div>
                    
                    {completedTasks.length > 5 && (
                      <Button variant="ghost" className="w-full mt-2">
                        Show {completedTasks.length - 5} more completed tasks
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="today">
          <div className="space-y-2">
            {tasksForToday.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full border-4 border-muted p-4 mb-4">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight mb-2">No tasks for today</h2>
                <p className="text-muted-foreground max-w-sm mb-4">
                  {searchQuery ? "Try adjusting your search or filters" : "Enjoy your day!"}
                </p>
                <Button onClick={() => setShowTaskForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add task for today
                </Button>
              </div>
            ) : (
              tasksForToday.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onStatusChange={handleTaskStatusChange} 
                  onEdit={() => handleEditTask(task)}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="todo">
          <div className="space-y-2">
            {todoTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full border-4 border-muted p-4 mb-4">
                  <Inbox className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight mb-2">
                  {searchQuery ? "No matching tasks" : "No tasks to do"}
                </h2>
                <p className="text-muted-foreground max-w-sm mb-4">
                  {searchQuery ? "Try adjusting your search or filters" : "You're all caught up!"}
                </p>
                <Button onClick={() => setShowTaskForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </div>
            ) : (
              todoTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onStatusChange={handleTaskStatusChange} 
                  onEdit={() => handleEditTask(task)}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="space-y-2">
            {completedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full border-4 border-muted p-4 mb-4">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight mb-2">No completed tasks</h2>
                <p className="text-muted-foreground max-w-sm mb-4">
                  Start checking off your to-do list
                </p>
              </div>
            ) : (
              completedTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onStatusChange={handleTaskStatusChange} 
                  onEdit={() => handleEditTask(task)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <TaskFormDialog 
        open={showTaskForm} 
        onOpenChange={setShowTaskForm}
        taskToEdit={taskToEdit}
      />
    </div>
  )
}