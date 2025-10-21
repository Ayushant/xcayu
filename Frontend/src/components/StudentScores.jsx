import React, { useState } from 'react';

const StudentScores = ({ scores }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewSubmissions = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    console.log('Viewing submissions for:', student.studentEmail);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  return (
    <>
      <div className="bg-white rounded-b-lg shadow overflow-hidden">
        {scores.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No student scores</h3>
              <p className="mt-1 text-sm text-gray-500">
                No students have completed any quizzes yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks (out of Super Admin total)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scores.map((score, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {score.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {score.studentEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {score.quizTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">{score.totalScore.toFixed(1)} / {score.maxMarks || ''}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${score.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          score.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {score.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {score.submittedAt ? new Date(score.submittedAt).toLocaleDateString() : 'Not submitted'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {score.hasSubmissions ? (
                        <button
                          onClick={() => handleViewSubmissions(score)}
                          className="text-orange-500 hover:text-orange-600 font-medium hover:underline"
                        >
                          View Submissions
                        </button>
                      ) : (
                        <span className="text-gray-500">No submissions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for viewing submissions */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/5 xl:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Student Submission Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedStudent.studentName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedStudent.studentEmail}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quiz Title</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedStudent.quizTitle}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${selectedStudent.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          selectedStudent.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Score</label>
                    <div className="mt-1 text-sm text-gray-900 font-medium">{selectedStudent.totalScore.toFixed(1)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted At</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedStudent.submittedAt ? new Date(selectedStudent.submittedAt).toLocaleString() : 'Not submitted'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Has Submissions:</span>
                      <span className="text-sm text-gray-900">{selectedStudent.hasSubmissions ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Questions:</span>
                      <span className="text-sm text-gray-900">{selectedStudent.totalQuestions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Performance Level:</span>
                      <span className="text-sm text-gray-900">
                        {selectedStudent.totalScore >= 80 ? 'Excellent' : 
                         selectedStudent.totalScore >= 60 ? 'Good' : 
                         selectedStudent.totalScore >= 40 ? 'Average' : 'Needs Improvement'}
                      </span>
                    </div>
                    {selectedStudent.feedback && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Instructor Feedback:</span>
                        <p className="text-sm text-gray-900 mt-1">{selectedStudent.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Question-Answer Review */}
                {selectedStudent.submissionDetails && selectedStudent.submissionDetails.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Question-by-Question Review</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedStudent.submissionDetails.map((detail, index) => (
                        <div key={detail.questionId} className={`p-4 rounded-lg border-2 ${
                          detail.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}>
                          <div className="flex items-start justify-between">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">
                              Question {index + 1}
                            </h5>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              detail.isCorrect 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {detail.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-700 font-medium">{detail.questionText}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student's Answer
                              </label>
                              <p className={`mt-1 text-sm ${
                                detail.isCorrect ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {detail.selectedAnswer}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Print Report
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentScores;
