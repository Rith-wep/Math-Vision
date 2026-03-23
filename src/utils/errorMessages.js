const FRONTEND_ERROR_MAP = new Map([
  ["Authentication failed. Please try again.", "ការផ្ទៀងផ្ទាត់មិនបានជោគជ័យទេ។ សូមព្យាយាមម្តងទៀត។"],
  ["Unable to load math resources right now.", "មិនអាចផ្ទុកឯកសារគណិតបានទេ។ សូមព្យាយាមម្តងទៀត។"],
  ["Unable to load formula suggestions.", "មិនអាចផ្ទុករូបមន្តណែនាំបានទេ។ សូមព្យាយាមម្តងទៀត។"],
  ["The math expression is not valid. Please check it again.", "សមីការមិនត្រឹមត្រូវទេ។ សូមពិនិត្យឡើងវិញ។"],
  ["Unable to process the selected image.", "មិនអាចដំណើរការរូបភាពដែលបានជ្រើសរើសបានទេ។"],
  ["Unable to read the selected image.", "មិនអាចអានរូបភាពដែលបានជ្រើសរើសបានទេ។"],
  ["Unable to optimize the selected image.", "មិនអាចរៀបចំរូបភាពសម្រាប់ស្កេនបានទេ។"],
  ["Unable to prepare the image for scanning.", "មិនអាចរៀបចំរូបភាពសម្រាប់ស្កេនបានទេ។"],
  ["Live camera is not supported here. Please upload a photo instead.", "ឧបករណ៍នេះមិនគាំទ្រកាមេរ៉ាផ្ទាល់ទេ។ សូមជ្រើសរើសរូបភាពជំនួស។"],
  ["Camera access was blocked. Please allow camera access or upload a photo.", "មិនអាចប្រើកាមេរ៉ាបានទេ។ សូមអនុញ្ញាតកាមេរ៉ា ឬជ្រើសរើសរូបភាពជំនួស។"],
  ["Unable to scan the image right now. Please try again.", "មិនអាចស្កេនរូបភាពបានទេ។ សូមព្យាយាមម្តងទៀត។"],
  ["Camera is not ready yet. Please try again.", "កាមេរ៉ាមិនទាន់រួចរាល់នៅឡើយទេ។ សូមព្យាយាមម្តងទៀត។"],
  ["Unable to capture the camera image right now.", "មិនអាចថតរូបពីកាមេរ៉ាបានទេ។ សូមព្យាយាមម្តងទៀត។"],
  ["Unable to capture the photo. Please try again.", "មិនអាចថតរូបបានទេ។ សូមព្យាយាមម្តងទៀត។"],
  ["Network Error", "បណ្តាញមានបញ្ហា។ សូមពិនិត្យអ៊ីនធឺណិតរបស់អ្នក។"]
]);

export const toKhmerErrorMessage = (message) => {
  if (!message) {
    return "មានបញ្ហាមួយបានកើតឡើង។ សូមព្យាយាមម្តងទៀត។";
  }

  return FRONTEND_ERROR_MAP.get(message) || message;
};
