import React, { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../../../_metronic/_partials/controls'
import {
	Button,
	TextField
} from '@material-ui/core'
import { useHistory, useParams } from 'react-router-dom'
import { getTextById, updateText } from '../../../../api/text'
import MultilanguageTabBlock from '../../../components/MultilanguageTabBlock'
import { useSkeleton } from '../../../hooks/useSkeleton'
import { alertError, alertSuccess } from '../../../../utils/logger'
import Editor from '../../../components/editor/Editor'


function getEmptyText() {
  return {
    title: {},
    content: {}
  }
}

export default function EditTextsPage() {
  const [text, setText] = useState(getEmptyText())
  const textId = useParams().id
  const history = useHistory()

  const { isLoading: isLoadingData, disableLoading: disableLoadingData, ContentSkeleton } = useSkeleton()

  useEffect(() => {
    if (!textId) {
      disableLoadingData()
      alertError({ error: null, customMessage: 'Could not get text.' })
      return history.push('/texts')
    }
    getTextById(textId).then(res => {
      if (res.status === 200) {
        setText(res.data)
        disableLoadingData()
      }
    }).catch(error => {
      alertError({ error: error, customMessage: 'Could not get text.' })
      history.push('/texts')
    })
  }, [textId, disableLoadingData, history])

  function saveText() {
    updateText(textId, text).then(res => {
        if (res.status === 200) {
          alertSuccess({ title: 'Saved!', customMessage: 'Changes successfully saved.' })
          history.push('/texts')
        }
      }).catch(error => {
        alertError({ error: error, customMessage: 'Could not save changes.' })
      })
  }

  const handleChange = (element, lang) => (event) => {
    if (lang) {
      if (event.target.value === ' ') return
      if (!text[element]) text[element] = {}
      let newText = text[element]
      newText[lang] = event.target.value
      setText({ ...text, [element]: newText })
    } else setText({ ...text, [element]: event.target.value })
  }

  const handleChangeEditor = (element, lang, value) => {
    if (lang) {
      if (value === ' ') return
      if (!text[element]) text[element] = {}
      let newText = text[element]
      newText[lang] = value
      setText({ ...text, [element]: newText })
    } else setText({ ...text, [element]: value })
  }


  const renderMultilanguageTabContent = lang => {
    return (
      <>
        <TextField
          id={`title`}
					label="Title"
          value={(text.title && text.title[lang]) || ''}
          onChange={handleChange('title', lang)}
          InputLabelProps={{
            shrink: true
          }}
          margin="normal"
          variant="outlined"
          required
        />
        <Editor
          body={(text.content && text.content[lang]) || ''}
          setBody={new_body => handleChangeEditor('content', lang, new_body)}
          className='max-height'
          lang={lang}
          placeholder={'Enter text content here...'}
        />
      </>
    )
  }

  if (isLoadingData)
    return <ContentSkeleton />
  else return (
    <>
      <Card>
        <CardHeader title='Edit text'>
        </CardHeader>
        <CardBody>
          <MultilanguageTabBlock
						multilanguageTabContent = {renderMultilanguageTabContent}
					/>
        </CardBody>
      </Card>
      <Button
        onClick={() => history.push('/texts')}
        variant="outlined"
        style={{ marginRight: '20px' }}>
        Back
      </Button>
      <Button
        onClick={() => saveText()}
        variant="outlined"
        color="primary"
        style={{ marginRight: '20px' }}>
        Save text
      </Button>
    </>
  );
}
