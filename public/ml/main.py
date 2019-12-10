from keras.datasets import mnist
import numpy as np
from matplotlib import pyplot as plt
from keras import utils
from keras import models
from keras.layers import Dense, Conv2D, Flatten

MODEL_SAVE_PATH = 'trained_model.json'

(X_train, y_train), (X_test, y_test) = mnist.load_data()

print(X_train.shape)

X_train = X_train.reshape(60000,28,28,1)
X_test = X_test.reshape(10000,28,28,1)

y_train = utils.to_categorical(y_train)
y_test = utils.to_categorical(y_test)

# TRAIN AND SAVE AS FILE PART

model = models.Sequential((
    Conv2D(32,3,1,activation='relu',input_shape=(28,28,1)),
    Conv2D(64,3,1,activation='relu',input_shape=(28,28,1)),
    Flatten(),
    Dense(100,activation='relu'),
    Dense(10,activation='softmax'),
), name='KhaMnist'
)

model.compile(optimizer='adam',loss='categorical_crossentropy')
model.fit(X_train,y_train,100,1,validation_data=(X_test,y_test))

model_json = model.to_json()
saveFile = open(MODEL_SAVE_PATH,'w+')
saveFile.write(model_json)
model.save_weights(model.name+'weights.h5')
saveFile.close()

num_of_test = 4

result = model.predict(X_test[:num_of_test])

for i in range(num_of_test):
    print('prediction no.' + str(i) + ': ' + result[i].index(max(result[i])))
    
# END TRAIN AND SAVE AS FILE PART

# LOAD AND USE PART

# json_file = open(MODEL_SAVE_PATH,'r')
# jsonmodel = json_file.read()
# json_file.close()

# loadmodel = models.model_from_json(jsonmodel)
# loadmodel.load_weights('KhaMnistweights.h5')

# num_of_test = 4

# result = loadmodel.predict(X_test[:num_of_test])

# for i in range(num_of_test):
#     print('test no.'+str(i))
#     print('prediction: ' + str(list(result[i]).index(max(result[i]))))
#     print('actual result: ' + str(y_test[i]) +'\n')

# END LOAD AND USE PART