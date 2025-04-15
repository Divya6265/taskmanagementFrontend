import React from 'react';

function Graph({ tasks }) {
  // Calculate task counts
  const completed = tasks.filter(task => task.status === 'Completed').length;
  const inProgress = tasks.filter(task => task.status === 'In Progress').length;
  const totalTasks = tasks.length;
  
  const completedPercent = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks > 0 ? Math.round((inProgress / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Task Status Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{totalTasks}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {totalTasks > 0 ? completedPercent : 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border mb-4 border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-gray-700">Task Status Distribution</h4>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-500">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-xs text-gray-500">In Progress</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-4">
          <div 
            className="bg-green-500 h-4 rounded-full" 
            style={{ width: `${completedPercent}%` }}
          ></div>
          <div 
            className="bg-yellow-500 h-4 rounded-full -mt-4" 
            style={{ width: `${inProgressPercent}%`, marginLeft: `${completedPercent}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">{completed}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-yellow-600">{inProgress}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
        </div>
      </div>

      {/* <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Task Status Ratio</h4>
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
            <div 
              className="absolute inset-0 rounded-full border-8 border-green-500" 
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
                transform: `rotate(${completedPercent * 3.6}deg)`
              }}
            ></div>
            <div 
              className="absolute inset-0 rounded-full border-8 border-yellow-500" 
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)`,
                transform: `rotate(${completedPercent * 3.6}deg)`
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-700">
                {totalTasks > 0 ? completedPercent : 0}%
              </span>
            </div>
          </div>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-500">Completed ({completed})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-xs text-gray-500">In Progress ({inProgress})</span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Graph;