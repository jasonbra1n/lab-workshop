function calculateDifference() {
  const startDate = new Date(document.getElementById('startDate').value);
  const endDate = new Date(document.getElementById('endDate').value);
  const includeEndDate = document.getElementById('includeEndDate').checked;
  
  if (isNaN(startDate) || isNaN(endDate)) {
      document.getElementById('result').innerText = "Please enter valid dates.";
      return;
  }
  
  const diffInTime = endDate - startDate;
  const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
  const result = includeEndDate ? diffInDays + 1 : diffInDays;
  
  document.getElementById('result').innerText = `The difference is ${result} day(s).`;
}
