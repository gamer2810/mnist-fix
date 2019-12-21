from keras.datasets import mnist
import numpy as np
from matplotlib import pyplot as plt
from keras import utils
from keras import models
import sys
from PIL import Image
from keras.layers import Dense, Conv2D, Flatten

MODEL_SAVE_PATH = './public/ml/model.json'
image_path = sys.argv[1]
image = Image.open(image_path).resize((28,28)).convert('L')
image = np.array(image)
image = image.reshape(1,28,28,1)
# print(image);

json_file = open(MODEL_SAVE_PATH,'r')
jsonmodel = json_file.read()
json_file.close()

loadmodel = models.model_from_json(jsonmodel)
loadmodel.load_weights('./public/ml/weights.h5')

result = loadmodel.predict(image)
prediction = np.argmax(result)
# print(str(prediction))
for x in result[0]:
 print(x)
# print(str(result[0]))
sys.stdout.flush()
